<?php
/**
 * Pricing Strategy Interface — Blueprint for all price calculation logic.
 *
 * @since      1.0.0
 * @package    OptionBay
 * @subpackage OptionBay/Pricing
 */

namespace OptionBay\Pricing;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Pricing Strategy Interface
 *
 * Defines the contract that all pricing strategies must implement.
 *
 * @since 1.0.0
 */
interface PricingStrategy {

	/**
	 * Calculate the price delta for a field.
	 *
	 * @since 1.0.0
	 * @param float $base_price        Product base price from WC.
	 * @param float $configured_amount The price amount from the option schema.
	 * @param mixed $field_value       The value submitted by the user.
	 * @param int   $quantity          Cart item quantity.
	 * @return float The calculated price addition.
	 */
	public function calculate( float $base_price, float $configured_amount, $field_value, int $quantity );
}
