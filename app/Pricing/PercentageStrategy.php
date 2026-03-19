<?php

namespace OptionBay\Pricing;

// Exit if accessed directly.
if (!defined('ABSPATH')) {
	exit;
}

/**
 * Percentage Strategy
 *
 * Adds a percentage of the product's base price.
 *
 * @since      1.0.0
 * @package    OptionBay
 * @subpackage OptionBay/Pricing
 */
class PercentageStrategy implements PricingStrategy
{
	public function calculate(float $base_price, float $configured_amount, $field_value, int $quantity): float
	{
		return ($base_price * $configured_amount) / 100.0;
	}
}
