<?php

namespace OptionBay\Core;

// Exit if accessed directly.
if (!defined('ABSPATH')) {
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
class AddonRenderer extends Base
{
	/**
	 * Register the hooks for this component.
	 *
	 * @since 1.0.0
	 * @param Plugin $plugin The Plugin instance.
	 * @return void
	 */
	public function run($plugin)
	{
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
	 * Hooked to: woocommerce_before_add_to_cart_button
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function render_product_options()
	{
		global $product;

		if (!$product || !is_a($product, 'WC_Product')) {
			return;
		}

		$product_id = $product->get_id();
		$group_ids = $this->get_groups_for_product($product_id);

		if (empty($group_ids)) {
			return;
		}

		$schemas = array();
		$html_output = '';

		foreach ($group_ids as $group_id) {
			$schema = $this->get_group_schema($group_id);
			if (empty($schema)) {
				continue;
			}

			$settings = $this->get_group_settings($group_id);
			$group_title = get_the_title($group_id);

			// Store for hydration
			$schemas[$group_id] = array(
				'title'  => $group_title,
				'fields' => $schema,
			);

			// Generate HTML
			$html_output .= $this->render_group($group_id, $group_title, $schema, $settings);
		}

		if (empty($html_output)) {
			return;
		}

		// Output the rendered fields
		echo '<div class="ob-options-wrapper" id="optionbay-options">';
		echo $html_output; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- HTML is escaped in render_group/field render methods
		echo '</div>';

		// Hydrate JS state
		$this->hydrate_schema($schemas, $product);
	}

	/**
	 * Render a single group's fields.
	 *
	 * @since 1.0.0
	 * @param int    $group_id  The group post ID.
	 * @param string $title     Group title.
	 * @param array  $schema    Field definitions array.
	 * @param array  $settings  Group settings.
	 * @return string HTML output.
	 */
	private function render_group(int $group_id, string $title, array $schema, array $settings): string
	{
		$layout = $settings['layout'] ?? 'flat';

		$html = sprintf(
			'<div class="ob-group ob-group--%s" data-group-id="%d">',
			esc_attr($layout),
			$group_id
		);

		if (!empty($title)) {
			$html .= sprintf('<h4 class="ob-group__title">%s</h4>', esc_html($title));
		}

		foreach ($schema as $field_schema) {
			$field = FieldFactory::create($group_id, $field_schema);
			if ($field) {
				$html .= $field->render();
			}
		}

		// Live pricing display
		$html .= '<div class="optionbay-live-total" style="display:none;">';
		$html .= sprintf(
			'<span class="ob-total-label">%s</span> ',
			esc_html__('Options Total:', 'optionbay')
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
	private function hydrate_schema(array $schemas, $product)
	{
		$base_price = floatval($product->get_price());
		$currency = WooCommerce::get_currency_symbol();
		$decimals = WooCommerce::get_price_decimals();
		$thousand_sep = WooCommerce::get_price_thousand_separator();
		$decimal_sep = WooCommerce::get_price_decimal_separator();
		$price_format = WooCommerce::get_price_format();

		$hydration_data = array(
			'schemas'       => $schemas,
			'basePrice'     => $base_price,
			'currency'      => $currency,
			'decimals'      => $decimals,
			'thousandSep'   => $thousand_sep,
			'decimalSep'    => $decimal_sep,
			'priceFormat'   => $price_format,
		);

		echo '<script type="text/javascript">';
		echo 'window.optionBaySchema = ' . wp_json_encode($hydration_data) . ';';
		echo '</script>';
	}

	/**
	 * Get group IDs assigned to a product (with caching).
	 *
	 * @since 1.0.0
	 * @param int $product_id
	 * @return array Group IDs.
	 */
	private function get_groups_for_product(int $product_id): array
	{
		$cache_key = 'ob_assignments_product_' . $product_id;
		$cached = wp_cache_get($cache_key, 'optionbay');

		if ($cached !== false) {
			return $cached;
		}

		// Get product categories and tags
		$category_ids = WooCommerce::get_product_cat_ids($product_id);
		$tag_ids = WooCommerce::get_product_tag_ids($product_id);

		$group_ids = DbManager::get_instance()->get_groups_for_product(
			$product_id,
			$category_ids,
			$tag_ids
		);

		// Filter to only published groups
		$group_ids = array_filter($group_ids, function ($gid) {
			return get_post_status($gid) === 'publish';
		});

		wp_cache_set($cache_key, $group_ids, 'optionbay', 300); // 5 min TTL

		return $group_ids;
	}

	/**
	 * Get a group's schema from post meta (with caching).
	 *
	 * @since 1.0.0
	 * @param int $group_id
	 * @return array
	 */
	private function get_group_schema(int $group_id): array
	{
		$cache_key = 'ob_schema_group_' . $group_id;
		$cached = wp_cache_get($cache_key, 'optionbay');

		if ($cached !== false) {
			return $cached;
		}

		$raw = get_post_meta($group_id, AddonGroup::META_SCHEMA, true);
		$schema = json_decode($raw, true);

		if (!is_array($schema)) {
			$schema = array();
		}

		wp_cache_set($cache_key, $schema, 'optionbay', 600); // 10 min TTL

		return $schema;
	}

	/**
	 * Get a group's settings from post meta.
	 *
	 * @since 1.0.0
	 * @param int $group_id
	 * @return array
	 */
	private function get_group_settings(int $group_id): array
	{
		$raw = get_post_meta($group_id, AddonGroup::META_SETTINGS, true);
		$settings = json_decode($raw, true);

		if (!is_array($settings)) {
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
	public function maybe_enqueue_assets()
	{
		if (!WooCommerce::is_product()) {
			return;
		}

		global $post;
		if (!$post) {
			return;
		}

		$group_ids = $this->get_groups_for_product($post->ID);
		if (empty($group_ids)) {
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
			array('jquery'),
			OPTIONBAY_VERSION,
			true
		);
	}
}
