<?php
/**
 * Quantity Multiplier Pricing Strategy — Multiplies cost by the cart item quantity.
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
 * Quantity Multiplier Pricing Strategy
 *
 * Multiplies the configured amount by the quantity of the product in the cart.
 *
 * @since 1.0.0
 */
class QuantityMultiplierStrategy implements PricingStrategy {

	/**
	 * Calculate the price delta.
	 *
	 * @since 1.0.0
	 * @param float $base_price Product base price.
	 * @param float $amount     Configured fee per unit.
	 * @param mixed $value      Submitted field value.
	 * @param int   $quantity   Product quantity in cart.
	 * @return float Total calculated cost.
	 */
	public function calculate( float $base_price, float $amount, $value, int $quantity ) {
		return $amount * floatval( $quantity );
	}
}
