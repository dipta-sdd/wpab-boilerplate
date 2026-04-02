<?php

namespace OptionBay\Pricing;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Quantity Multiplier Strategy
 *
 * Adds an amount multiplied by the quantity in the cart.
 * Note: Since WooCommerce already multiplies the final item price by quantity,
 * configuring this means the base addition per unit scales with quantity,
 * resulting in an exponentially increasing cost if not handled carefully.
 * Usually, FlatFee becomes (Flat * Qty) naturally. This strategy is for
 * "fee increases as quantity increases" per item.
 *
 * @since      1.0.0
 * @package    OptionBay
 * @subpackage OptionBay/Pricing
 */
class QuantityMultiplierStrategy implements PricingStrategy {

	/**
	 * Calculate the quantity multiplier addition.
	 *
	 * Adds an amount multiplied by the quantity in the cart. This means the fee
	 * increases as the cart quantity increases.
	 *
	 * @since 1.0.0
	 * @param float $base_price        Product base price.
	 * @param float $configured_amount The mapped fee per unit.
	 * @param mixed $field_value       The submitted value.
	 * @param int   $quantity          Cart quantity.
	 * @return float The calculated exponential cost.
	 */
	public function calculate( float $base_price, float $configured_amount, $field_value, int $quantity ) {
		$qty        = max( 1, $quantity );
		$calculated = $configured_amount * $qty;

		optionbay_log( "QuantityMultiplierStrategy: calculated {$calculated} ({$configured_amount} * {$qty})", 'DEBUG' );

		return $calculated;
	}
}
