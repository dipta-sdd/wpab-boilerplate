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
	/**
	 * Calculate the flat fee addition.
	 * 
	 * Returns the configured fixed amount directly regardless of the
	 * product price.
	 * 
	 * @since 1.0.0
	 * @param float $base_price        Product base price.
	 * @param float $configured_amount Amount configured in option settings.
	 * @param mixed $field_value       The submitted value.
	 * @param int   $quantity          Cart quantity.
	 * @return float The fixed price delta.
	 */
	public function calculate(float $base_price, float $configured_amount, $field_value, int $quantity)
	{
		optionbay_log("FlatFeeStrategy: Applied flat fee of {$configured_amount}", 'DEBUG');
		return $configured_amount;
	}
}
