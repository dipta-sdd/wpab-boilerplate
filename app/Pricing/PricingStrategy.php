<?php

namespace OptionBay\Pricing;

// Exit if accessed directly.
if (!defined('ABSPATH')) {
	exit;
}

/**
 * Interface for all pricing strategies.
 *
 * @since      1.0.0
 * @package    OptionBay
 * @subpackage OptionBay/Pricing
 */
interface PricingStrategy
{
	/**
	 * Calculate the price addition for a field.
	 *
	 * @since 1.0.0
	 * @param float $base_price The base price of the product.
	 * @param float $configured_amount The price configured in the option group settings.
	 * @param mixed $field_value The value submitted by the customer.
	 * @param int   $quantity The quantity of the item in the cart.
	 * @return float The additional price amount to be added to the base price.
	 */
	public function calculate(float $base_price, float $configured_amount, $field_value, int $quantity): float;
}
