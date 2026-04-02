<?php
/**
 * Addon Renderer — handles displaying option fields on the product page.
 *
 * @since      1.0.0
 * @package    OptionBay
 * @subpackage OptionBay/Core
 */

namespace OptionBay\Core;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use OptionBay\Data\DbManager;
use OptionBay\Fields\FieldFactory;
use OptionBay\Helper\WooCommerce;

/**
 * Rendering Engine — hooks into WooCommerce product pages to display
 * option groups based on assignment rules.
 *
 * Pipeline:
 *   1. Assignment Resolution: query lookup table for matching groups
 *   2. Schema Retrieval: load JSON schemas from post meta
 *   3. HTML Generation: pass each field through FieldFactory
 *   4. State Hydration: print optionBaySchema + optionBayBasePrice to JS
 *
 * @since      1.0.0
 * @package    OptionBay
 * @subpackage OptionBay/Core
 */
class AddonRenderer extends Base {

	/**
	 * Register the hooks for this component.
	 *
	 * @since 1.0.0
	 * @param Plugin $plugin The Plugin instance.
	 * @return void
	 */
	public function run( $plugin ) {
		$loader = $plugin->get_loader();

		// Render fields on product page
		$loader->add_action(
			'woocommerce_before_add_to_cart_button',
			$this,
			'render_product_options',
			10
		);

		// Enqueue frontend assets conditionally
		$loader->add_action(
			'wp_enqueue_scripts',
			$this,
			'maybe_enqueue_assets'
		);
	}

	/**
	 * Render option groups on the product page.
	 *
	 * This function hooks into the WooCommerce product page to fetch and display the assigned option groups and fields.
	 *
	 * Hooked to: woocommerce_before_add_to_cart_button
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function render_product_options() {
		global $product;

		// Skip if there's no valid WooCommerce product context
		if ( ! $product || ! is_a( $product, 'WC_Product' ) ) {
			return;
		}

		$product_id = $product->get_id();
		optionbay_log( "Rendering options for Product ID: {$product_id}", 'DEBUG' );

		$group_ids = $this->get_groups_for_product( $product_id );

		// Stop rendering if no groups are assigned
		if ( empty( $group_ids ) ) {
			optionbay_log( "No option groups assigned to Product ID: {$product_id}", 'DEBUG' );
			return;
		}

		$schemas     = array();
		$html_output = '';

		// Loop through all assigned option groups to generate their HTML
		foreach ( $group_ids as $group_id ) {
			$schema = $this->get_group_schema( $group_id );
			if ( empty( $schema ) ) {
				continue;
			}

			$settings    = $this->get_group_settings( $group_id );
			$group_title = get_the_title( $group_id );

			// Store the schema in an array for JavaScript hydration later
			$schemas[ $group_id ] = array(
				'title'  => $group_title,
				'fields' => $schema,
			);

			// Generate the HTML for the group's fields
			$html_output .= $this->render_group( $group_id, $group_title, $schema, $settings );
		}

		if ( empty( $html_output ) ) {
			return;
		}

		optionbay_log( "Successfully built option fields HTML for Product ID: {$product_id}", 'INFO' );

		// Output the fully rendered fields wrapper
		echo '<div class="ob-options-wrapper" id="optionbay-options">';
		echo $html_output; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- HTML is escaped in render_group/field render methods
		echo '</div>';

		// Hydrate JS state with the pricing rules and logic
		$this->hydrate_schema( $schemas, $product );
	}

	/**
	 * Render a single group's fields.
	 *
	 * Maps through the JSON schema configuration for a particular Option Group
	 * and uses the FieldFactory to generate the matching HTML for each field.
	 *
	 * @since 1.0.0
	 * @param int    $group_id  The group post ID.
	 * @param string $title     Group title.
	 * @param array  $schema    Field definitions array.
	 * @param array  $settings  Group settings.
	 * @return string HTML output.
	 */
	private function render_group( int $group_id, string $title, array $schema, array $settings ) {
		$layout = $settings['layout'] ?? 'flat';

		$html = sprintf(
			'<div class="ob-group ob-group--%s" data-group-id="%d">',
			esc_attr( $layout ),
			$group_id
		);

		if ( ! empty( $title ) ) {
			$html .= sprintf( '<h4 class="ob-group__title">%s</h4>', esc_html( $title ) );
		}

		// Iterate over every field inside the group's schema
		foreach ( $schema as $field_schema ) {
			// Leverage factory pattern to instantiate the right HTML generator
			$field = FieldFactory::create( $group_id, $field_schema );
			if ( $field ) {
				$html .= $field->render();
			} else {
				$type = $field_schema['type'] ?? 'unknown';
				optionbay_log( "Warning: Unrecognized field type '{$type}' in group {$group_id}", 'ERROR' );
			}
		}

		// Setup the live pricing display container at the bottom of the group
		$html .= '<div class="optionbay-live-total" style="display:none;">';
		$html .= sprintf(
			'<span class="ob-total-label">%s</span> ',
			esc_html__( 'Options Total:', 'optionbay' )
		);
		$html .= '<span class="amount"></span>';
		$html .= '</div>';

		$html .= '</div>';

		return $html;
	}

	/**
	 * Hydrate the page with JSON schema data for the JS engine.
	 *
	 * Prints window.optionBaySchema and window.optionBayBasePrice.
	 *
	 * @since 1.0.0
	 * @param array       $schemas  Grouped schemas indexed by group ID.
	 * @param \WC_Product $product  The current product.
	 * @return void
	 */
	private function hydrate_schema( array $schemas, $product ) {
		$base_price   = floatval( $product->get_price() );
		$currency     = WooCommerce::get_currency_symbol();
		$decimals     = WooCommerce::get_price_decimals();
		$thousand_sep = WooCommerce::get_price_thousand_separator();
		$decimal_sep  = WooCommerce::get_price_decimal_separator();
		$price_format = WooCommerce::get_price_format();

		$hydration_data = array(
			'schemas'     => $schemas,
			'basePrice'   => $base_price,
			'currency'    => $currency,
			'decimals'    => $decimals,
			'thousandSep' => $thousand_sep,
			'decimalSep'  => $decimal_sep,
			'priceFormat' => $price_format,
		);

		echo '<script type="text/javascript">';
		echo 'window.optionBaySchema = ' . wp_json_encode( $hydration_data ) . ';';
		echo '</script>';
	}

	/**
	 * Get group IDs assigned to a product (with caching).
	 *
	 * Determines which option groups globally or specifically apply to this product
	 * checking categories, tags, and product-specific assignments.
	 *
	 * @since 1.0.0
	 * @param int $product_id The product ID to query for.
	 * @return array Group IDs.
	 */
	private function get_groups_for_product( int $product_id ) {
		$cache_key = 'ob_assignments_product_' . $product_id;
		$cached    = wp_cache_get( $cache_key, 'optionbay' );

		if ( false !== $cached ) {
			return $cached;
		}

		// Retrieve all term associations for the product to match global category/tag rules
		$category_ids = WooCommerce::get_product_cat_ids( $product_id );
		$tag_ids      = WooCommerce::get_product_tag_ids( $product_id );

		// Ask DbManager to resolve assignments
		$group_ids = DbManager::get_instance()->get_groups_for_product(
			$product_id,
			$category_ids,
			$tag_ids
		);

		// Ensure we don't return groups that correspond to a draft or trashed post
		$group_ids = array_filter(
			$group_ids,
			function ( $gid ) {
				return 'publish' === get_post_status( $gid );
			}
		);

		wp_cache_set( $cache_key, $group_ids, 'optionbay', 300 ); // 5 min TTL

		return $group_ids;
	}

	/**
	 * Get a group's schema from post meta (with caching).
	 *
	 * @since 1.0.0
	 * @param int $group_id The group ID.
	 * @return array
	 */
	private function get_group_schema( int $group_id ) {
		$cache_key = 'ob_schema_group_' . $group_id;
		$cached    = wp_cache_get( $cache_key, 'optionbay' );

		if ( false !== $cached ) {
			return $cached;
		}

		$raw    = get_post_meta( $group_id, AddonGroup::META_SCHEMA, true );
		$schema = json_decode( $raw, true );

		if ( ! is_array( $schema ) ) {
			$schema = array();
		}

		wp_cache_set( $cache_key, $schema, 'optionbay', 600 ); // 10 min TTL

		return $schema;
	}

	/**
	 * Get a group's settings from post meta.
	 *
	 * @since 1.0.0
	 * @param int $group_id The group ID.
	 * @return array
	 */
	private function get_group_settings( int $group_id ) {
		$raw      = get_post_meta( $group_id, AddonGroup::META_SETTINGS, true );
		$settings = json_decode( $raw, true );

		if ( ! is_array( $settings ) ) {
			$settings = AddonGroup::get_default_settings();
		}

		return $settings;
	}

	/**
	 * Conditionally enqueue frontend assets on product pages.
	 *
	 * Only loads if the current product has active option groups.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function maybe_enqueue_assets() {
		if ( ! WooCommerce::is_product() ) {
			return;
		}

		global $post;
		if ( ! $post ) {
			return;
		}

		$group_ids = $this->get_groups_for_product( $post->ID );
		if ( empty( $group_ids ) ) {
			return;
		}

		// Frontend CSS
		wp_enqueue_style(
			'optionbay-frontend',
			OPTIONBAY_URL . 'assets/css/frontend.css',
			array(),
			OPTIONBAY_VERSION
		);

		// Frontend JS
		wp_enqueue_script(
			'optionbay-frontend',
			OPTIONBAY_URL . 'assets/js/frontend.js',
			array( 'jquery' ),
			OPTIONBAY_VERSION,
			true
		);
	}
}
