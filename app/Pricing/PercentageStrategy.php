<?php
/**
 * Percentage Pricing Strategy — Adds a percentage of the base price.
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
 * Percentage Pricing Strategy
 *
 * Calculates a price delta based on a percentage of the product base price.
 *
 * @since 1.0.0
 */
class PercentageStrategy implements PricingStrategy {

	/**
	 * Calculate the price delta.
	 *
	 * @since 1.0.0
	 * @param float $base_price Product base price.
	 * @param float $amount     Percentage (e.g. 10.0 for 10%).
	 * @param mixed $value      Submitted field value.
	 * @param int   $quantity   Cart item quantity.
	 * @return float Calculated percentage amount.
	 */
	public function calculate( float $base_price, float $amount, $value, int $quantity ) {
		return $base_price * ( $amount / 100 );
	}
}
