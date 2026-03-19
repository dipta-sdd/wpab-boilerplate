<?php

namespace OptionBay\Pricing;

// Exit if accessed directly.
if (!defined('ABSPATH')) {
	exit;
}

/**
 * Flat Fee Strategy
 *
 * Adds a fixed amount regardless of product base price or quantity.
 * Note: If it should multiply by quantity, it happens globally in WC,
 * so the addition here is per-unit.
 *
 * @since      1.0.0
 * @package    OptionBay
 * @subpackage OptionBay/Pricing
 */
class FlatFeeStrategy implements PricingStrategy
{
	public function calculate(float $base_price, float $configured_amount, $field_value, int $quantity): float
	{
		return $configured_amount;
	}
}
