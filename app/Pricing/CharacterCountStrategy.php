<?php
/**
 * Character Count Pricing Strategy — Multiplies cost by the length of the submitted text.
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
 * Character Count Pricing Strategy
 *
 * Multiplies the configured amount by the number of characters in the user input.
 *
 * @since 1.0.0
 */
class CharacterCountStrategy implements PricingStrategy {

	/**
	 * Calculate the price delta.
	 *
	 * @since 1.0.0
	 * @param float $base_price Product base price.
	 * @param float $amount     Configured price per character.
	 * @param mixed $value      The submitted text.
	 * @param int   $quantity   Cart item quantity.
	 * @return float Total calculated cost.
	 */
	public function calculate( float $base_price, float $amount, $value, int $quantity ) {
		$len = mb_strlen( (string) $value );
		return $len * $amount;
	}
}
