<?php

namespace OptionBay\Core;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use OptionBay\Data\DbManager;
use OptionBay\Fields\FieldFactory;
use OptionBay\Helper\ConditionEvaluator;
use OptionBay\Helper\WooCommerce;
use OptionBay\Pricing\PricingEngine;

/**
 * Cart Manager — manages the WooCommerce cart and checkout pipeline.
 *
 * Implements the 5 core stages:
 *  1. Validation (before add to cart)
 *  2. Add item data (store in cart session, calculate prices/weights)
 *  3. Calculate totals (apply math to cart)
 *  4. Get item data (display in cart/checkout)
 *  5. Order line item (save to DB on checkout)
 *
 * @since      1.0.0
 * @package    OptionBay
 * @subpackage OptionBay/Core
 */
class CartManager extends Base {

	/**
	 * Unique key used to store data in the WC Cart item.
	 */
	const CART_KEY = 'optionbay_addons';

	public function run( $plugin ) {
		$loader = $plugin->get_loader();

		// Stage 1: Validation
		$loader->add_filter( 'woocommerce_add_to_cart_validation', $this, 'validate_add_to_cart', 10, 3 );

		// Stage 2: Add cart item data (Process & Math)
		$loader->add_filter( 'woocommerce_add_cart_item_data', $this, 'add_cart_item_data', 10, 3 );

		// Stage 3: Calculate totals
		$loader->add_action( 'woocommerce_before_calculate_totals', $this, 'calculate_totals', 100, 1 );

		// Stage 4: Cart & Checkout display
		$loader->add_filter( 'woocommerce_get_item_data', $this, 'get_item_data', 10, 2 );

		// Stage 5: Order meta storage
		$loader->add_action( 'woocommerce_checkout_create_order_line_item', $this, 'add_order_item_meta', 10, 4 );

		// Helper: Ensure edit-in-cart works
		$loader->add_filter( 'woocommerce_add_cart_item', $this, 'load_cart_item_data', 10, 1 );
	}

	/**
	 * Get groups assigned to a product (re-uses existing cached logic).
	 *
	 * This function is a dispatcher that checks for all applicable campaign types and returns the group ids.
	 *
	 * @since 1.0.0
	 * @param int $product_id
	 * @return array
	 */
	private function get_groups_for_product( int $product_id ) {
		$cache_key = 'ob_assignments_product_' . $product_id;
		$cached    = wp_cache_get( $cache_key, 'optionbay' );

		if ( $cached !== false ) {
			return $cached;
		}

		$category_ids = WooCommerce::get_product_cat_ids( $product_id );
		$tag_ids      = WooCommerce::get_product_tag_ids( $product_id );

		$group_ids = DbManager::get_instance()->get_groups_for_product(
			$product_id,
			$category_ids,
			$tag_ids
		);

		$group_ids = array_filter(
			$group_ids,
			function ( $gid ) {
				return get_post_status( $gid ) === 'publish';
			}
		);

		wp_cache_set( $cache_key, $group_ids, 'optionbay', 300 );

		return $group_ids;
	}

	/**
	 * Get group schema from post meta.
	 *
	 * @since 1.0.0
	 * @param int $group_id The option group post ID.
	 * @return array The JSON-decoded schema array.
	 */
	private function get_group_schema( int $group_id ) {
		$cache_key = 'ob_schema_group_' . $group_id;
		$cached    = wp_cache_get( $cache_key, 'optionbay' );

		if ( $cached !== false ) {
			return $cached;
		}

		$raw    = get_post_meta( $group_id, AddonGroup::META_SCHEMA, true );
		$schema = json_decode( $raw, true );

		if ( ! is_array( $schema ) ) {
			$schema = array();
		}

		wp_cache_set( $cache_key, $schema, 'optionbay', 600 );

		return $schema;
	}

	/**
	 * Stage 1: Validation
	 *
	 * Validates all submitted option fields before the item is successfully added to the cart.
	 *
	 * Hook: woocommerce_add_to_cart_validation
	 *
	 * @since 1.0.0
	 * @param bool $passed     Whether validation has passed so far.
	 * @param int  $product_id The product ID being added.
	 * @param int  $quantity   The quantity being added.
	 * @return bool True if validation passes, false otherwise (will add WC error notice).
	 */
	public function validate_add_to_cart( $passed, $product_id, $quantity ) {
		$group_ids = $this->get_groups_for_product( $product_id );
		if ( empty( $group_ids ) ) {
			return $passed;
		}

		// Look for submitted data
		// Format: $_POST['optionbay_addons'][$group_id][$field_id] = $value
		// We use $_REQUEST to allow GET reqs to add to cart (though rare)
		$submitted_data = $_REQUEST['optionbay_addons'] ?? array();

		// If file uploads are present
		$files_data = $_FILES['optionbay_addons'] ?? array();

		foreach ( $group_ids as $group_id ) {
			$schema     = $this->get_group_schema( $group_id );
			$group_data = $submitted_data[ $group_id ] ?? array();

			// Format $_FILES array for easier access
			$group_files = array();
			if ( ! empty( $files_data['name'][ $group_id ] ) ) {
				foreach ( $files_data['name'][ $group_id ] as $field_id => $name ) {
					$group_files[ $field_id ] = array(
						'name'     => $name,
						'type'     => $files_data['type'][ $group_id ][ $field_id ] ?? '',
						'tmp_name' => $files_data['tmp_name'][ $group_id ][ $field_id ] ?? '',
						'error'    => $files_data['error'][ $group_id ][ $field_id ] ?? UPLOAD_ERR_NO_FILE,
						'size'     => $files_data['size'][ $group_id ][ $field_id ] ?? 0,
					);
				}
			}

			foreach ( $schema as $field_schema ) {
				// Stop if condition says hide
				if ( ! ConditionEvaluator::is_visible( $field_schema, $group_data ) ) {
					continue;
				}

				$field = FieldFactory::create( $group_id, $field_schema );
				if ( ! $field ) {
					continue;
				}

				// Determine value
				$field_id = $field_schema['id'];
				$value    = $group_data[ $field_id ] ?? null;
				if ( $field_schema['type'] === 'file' ) {
					$value = $group_files[ $field_id ] ?? null;
					if ( $value && $value['error'] === UPLOAD_ERR_NO_FILE ) {
						$value = null; // No file selected
					}
				}

				$result = $field->validate( $value );
				if ( is_wp_error( $result ) ) {
					wc_add_notice( $result->get_error_message(), 'error' );
					return false;
				}
			}
		}

		return $passed;
	}

	/**
	 * Stage 2: Add cart item data (Session storage & Math)
	 *
	 * Stores the verified user choices into the WooCommerce cart session securely. It handles
	 * formatting, sanitization, and WordPress native file uploads before committing to session.
	 *
	 * Hook: woocommerce_add_cart_item_data
	 *
	 * @since 1.0.0
	 * @param array $cart_item_data The cart item data structure.
	 * @param int   $product_id     The product ID.
	 * @param int   $variation_id   The variation ID.
	 * @return array Modified cart item data.
	 * @throws \Exception If a file upload passes validation but fails native WP processing.
	 */
	public function add_cart_item_data( $cart_item_data, $product_id, $variation_id ) {
		$group_ids = $this->get_groups_for_product( $product_id );
		if ( empty( $group_ids ) ) {
			return $cart_item_data;
		}

		$submitted_data = $_REQUEST['optionbay_addons'] ?? array();
		$files_data     = $_FILES['optionbay_addons'] ?? array();

		$session_data          = array();
		$total_price_addition  = 0.0;
		$total_weight_addition = 0.0;

		foreach ( $group_ids as $group_id ) {
			$schema     = $this->get_group_schema( $group_id );
			$group_data = $submitted_data[ $group_id ] ?? array();

			$group_files = array();
			if ( ! empty( $files_data['name'][ $group_id ] ) ) {
				foreach ( $files_data['name'][ $group_id ] as $field_id => $name ) {
					$group_files[ $field_id ] = array(
						'name'     => $name,
						'type'     => $files_data['type'][ $group_id ][ $field_id ] ?? '',
						'tmp_name' => $files_data['tmp_name'][ $group_id ][ $field_id ] ?? '',
						'error'    => $files_data['error'][ $group_id ][ $field_id ] ?? UPLOAD_ERR_NO_FILE,
						'size'     => $files_data['size'][ $group_id ][ $field_id ] ?? 0,
					);
				}
			}

			foreach ( $schema as $field_schema ) {
				if ( ! ConditionEvaluator::is_visible( $field_schema, $group_data ) ) {
					continue;
				}

				$field = FieldFactory::create( $group_id, $field_schema );
				if ( ! $field ) {
					continue;
				}

				$field_id = $field_schema['id'];
				$value    = $group_data[ $field_id ] ?? null;

				// Handle File Uploads securely
				if ( $field_schema['type'] === 'file' && ! empty( $group_files[ $field_id ] ) && $group_files[ $field_id ]['error'] !== UPLOAD_ERR_NO_FILE ) {
					$upload = $this->handle_file_upload( $group_files[ $field_id ] );
					if ( is_wp_error( $upload ) ) {
						wc_add_notice( $upload->get_error_message(), 'error' );
						// Throwing exception because validation passed but upload failed
						throw new \Exception( $upload->get_error_message() );
					}
					$value = $upload; // array with url and file parts
				}

				// Only save non-empty values
				if ( $value !== null && $value !== '' ) {
					$sanitized_value = $field->sanitize( $value );
					optionbay_log( "[OptionBay Cart] Storing session data for field {$field_id} with value " . print_r( $sanitized_value, true ), 'DEBUG' );

					// Store raw data for display and Order meta
					$session_data[] = array(
						'group_id'      => $group_id,
						'field_id'      => $field_id,
						'name'          => $field_schema['label'] ?? $field_schema['id'],
						'value'         => $sanitized_value,
						'display_value' => $field->get_display_value( $sanitized_value ),
						'field_type'    => $field_schema['type'],
						'weight'        => $field->get_weight( $sanitized_value ),
					);
				}
			}
		}

		if ( ! empty( $session_data ) ) {
			// Save to cart item data
			$cart_item_data[ self::CART_KEY ] = array(
				'fields' => $session_data,
				// Calculate total prices during calculate_totals
			);

			// Force unique cart item key so different options don't merge
			$cart_item_data['unique_key'] = md5( microtime() . wp_rand() );
		}

		return $cart_item_data;
	}

	/**
	 * Handle native WordPress attachment upload safely.
	 */
	private function handle_file_upload( $file_array ) {
		require_once ABSPATH . 'wp-admin/includes/file.php';

		$upload_overrides = array( 'test_form' => false );
		$movefile         = wp_handle_upload( $file_array, $upload_overrides );

		if ( $movefile && ! isset( $movefile['error'] ) ) {
			return $movefile;
		}

		return new \WP_Error( 'upload_error', $movefile['error'] );
	}

	/**
	 * Stage 3: Price/weight modification
	 *
	 * Takes the cart items, inspects OptionBay metadata inside them, calculates the additional costs
	 * via the Strategy-powered PricingEngine, and sets the updated total back on the product instance.
	 *
	 * Hook: woocommerce_before_calculate_totals
	 *
	 * @since 1.0.0
	 * @param \WC_Cart $cart_object The WooCommerce Cart object.
	 * @return void
	 */
	public function calculate_totals( $cart_object ) {
		if ( wp_doing_ajax() && ! did_action( 'woocommerce_calculate_totals' ) ) {
			$_add_to_cart = apply_filters( 'woocommerce_add_to_cart_calculate_totals_ajax', true );
			if ( ! $_add_to_cart ) {
				// We actually need to calculate it regardless for some ajax contexts.
			}
		}

		// Ensure we don't recurse if our own plugin triggers price checks causing an infinite loop
		static $is_calculating = false;
		if ( $is_calculating ) {
			optionbay_log( '[OptionBay Pricing] Already calculating, skipping recursive loop.', 'INFO' );
			return;
		}
		$is_calculating = true;

		foreach ( $cart_object->get_cart() as $cart_item_key => $cart_item ) {
			// Skip products that don't have our custom fields in the cart item session
			if ( ! isset( $cart_item[ self::CART_KEY ] ) || empty( $cart_item[ self::CART_KEY ]['fields'] ) ) {
				continue;
			}

			$product               = $cart_item['data'];
			$base_price            = (float) $product->get_price( 'edit' );
			$total_price_addition  = 0.0;
			$total_weight_addition = 0.0;

			optionbay_log( "[OptionBay Pricing] Cart item {$cart_item_key} Base Price: {$base_price}", 'DEBUG' );

			// Loop through all OptionBay fields stored for this given cart item
			foreach ( $cart_item[ self::CART_KEY ]['fields'] as &$field_data ) {
				$total_weight_addition += $field_data['weight'];

				$group_id = $field_data['group_id'] ?? 0;
				$field_id = $field_data['field_id'] ?? '';
				if ( ! $group_id || ! $field_id ) {
					continue;
				}

				// We must re-fetch the raw schema configuration to run pricing because configuration could be complex
				$schema       = $this->get_group_schema( $group_id );
				$field_schema = null;
				foreach ( $schema as $s ) {
					if ( $s['id'] === $field_id ) {
						$field_schema = $s;
						break;
					}
				}

				if ( ! $field_schema ) {
					optionbay_log( "[OptionBay Pricing] Schema not found for group {$group_id}, field {$field_id}", 'ERROR' );
					continue;
				}

				$qty = $cart_item['quantity'];

				// Calculate price dynamically based on field type and Pricing Strategy Context
				if ( in_array( $field_schema['type'], array( 'select', 'radio', 'checkbox' ) ) ) {
					$options = $field_schema['options'] ?? array();
					$values  = is_array( $field_data['value'] ) ? $field_data['value'] : array( $field_data['value'] );

					optionbay_log( "[OptionBay Pricing] Categorical field {$field_id} values: " . print_r( $values, true ), 'DEBUG' );

					foreach ( $values as $val ) {
						foreach ( $options as $opt ) {
							if ( $opt['value'] === $val ) {
								$p_type                = $opt['price_type'] ?? 'flat';
								$p_amount              = (float) ( $opt['price'] ?? 0 );
								$price_delta           = PricingEngine::calculate( $p_type, $base_price, $p_amount, $val, $qty );
								$total_price_addition += $price_delta;
								optionbay_log( "[OptionBay Pricing] Adding {$price_delta} for {$val} (Type: {$p_type}, Configured: {$p_amount})", 'DEBUG' );
							}
						}
					}
				} else {
					$p_type                = $field_schema['price_type'] ?? 'none';
					$p_amount              = (float) ( $field_schema['price'] ?? 0 );
					$price_delta           = PricingEngine::calculate( $p_type, $base_price, $p_amount, $field_data['value'], $qty );
					$total_price_addition += $price_delta;
					optionbay_log( "[OptionBay Pricing] Scalar field {$field_id} adding {$price_delta} (Type: {$p_type}, Configured: {$p_amount})", 'DEBUG' );
				}
			}

			if ( $total_price_addition > 0 ) {
				$new_price = $base_price + $total_price_addition;
				$cart_object->cart_contents[ $cart_item_key ]['data']->set_price( $new_price );
				optionbay_log( "[OptionBay Pricing] Manipulated product instance set to final price: {$new_price}", 'INFO' );
			}

			if ( $total_weight_addition > 0 ) {
				$base_weight = (float) $product->get_weight();
				$cart_object->cart_contents[ $cart_item_key ]['data']->set_weight( $base_weight + $total_weight_addition );
			}
		}

		$is_calculating = false;
	}

	/**
	 * Stage 4: Cart display
	 *
	 * Modifies the visible array structure injected into the frontend Cart and Checkout templates
	 * native to WooCommerce. Formats file links properly.
	 *
	 * Hook: woocommerce_get_item_data
	 *
	 * @since 1.0.0
	 * @param array $item_data Existing item data.
	 * @param array $cart_item The cart item payload.
	 * @return array Modified summary array.
	 */
	public function get_item_data( $item_data, $cart_item ) {
		if ( isset( $cart_item[ self::CART_KEY ] ) && ! empty( $cart_item[ self::CART_KEY ]['fields'] ) ) {
			foreach ( $cart_item[ self::CART_KEY ]['fields'] as $field ) {
				// Format file upload to show link
				$display = $field['display_value'];
				if ( $field['field_type'] === 'file' && is_array( $field['value'] ) && isset( $field['value']['url'] ) ) {
					$display = sprintf(
						'<a href="%s" target="_blank" rel="noopener noreferrer">%s</a>',
						esc_url( $field['value']['url'] ),
						esc_html( $field['display_value'] )
					);
				}

				$item_data[] = array(
					'name'    => $field['name'],
					'value'   => $display,
					'display' => '', // tells WC not to escape again if we returned HTML in 'value'
				);
			}
		}

		return $item_data;
	}

	/**
	 * Stage 5: Order meta storage
	 * Hook: woocommerce_checkout_create_order_line_item
	 */
	public function add_order_item_meta( $item, $cart_item_key, $values, $order ) {
		if ( isset( $values[ self::CART_KEY ] ) && ! empty( $values[ self::CART_KEY ]['fields'] ) ) {
			foreach ( $values[ self::CART_KEY ]['fields'] as $field ) {

				$display = $field['display_value'];
				if ( $field['field_type'] === 'file' && is_array( $field['value'] ) && isset( $field['value']['url'] ) ) {
					// In order meta, we save the full URL
					$display = $field['value']['url'];
				}

				$item->add_meta_data( $field['name'], $display );
			}
		}
	}

	/**
	 * Recover data from session (needed for cart edits or session rebuild)
	 * Hook: woocommerce_add_cart_item
	 */
	public function load_cart_item_data( $cart_item ) {
		if ( isset( $cart_item[ self::CART_KEY ] ) ) {
			// Custom logic if we ever need to re-validate item data when loaded from DB
		}
		return $cart_item;
	}
}
