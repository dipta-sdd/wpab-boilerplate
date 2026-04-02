<?php
/**
 * Flat Fee Pricing Strategy — Adds a fixed amount to the product price.
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
 * Flat Fee Pricing Strategy
 *
 * A simple addition of a fixed cost to the product base price.
 *
 * @since 1.0.0
 */
class FlatFeeStrategy implements PricingStrategy {

	/**
	 * Calculate the price delta.
	 *
	 * @since 1.0.0
	 * @param float $base_price Product base price.
	 * @param float $amount     Fixed fee amount.
	 * @param mixed $value      Submitted field value.
	 * @param int   $quantity   Cart item quantity.
	 * @return float The fixed fee.
	 */
	public function calculate( float $base_price, float $amount, $value, int $quantity ) {
		return $amount;
	}
}
