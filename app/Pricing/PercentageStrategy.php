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
	/**
	 * Calculate the percentage pricing addition.
	 * 
	 * Derives a dynamic fee by taking a percentage of the existing product base price.
	 * 
	 * @since 1.0.0
	 * @param float $base_price        Product base price.
	 * @param float $configured_amount The percentage value (e.g., 10 for 10%).
	 * @param mixed $field_value       The submitted value.
	 * @param int   $quantity          Cart quantity.
	 * @return float The calculated fee value.
	 */
	public function calculate(float $base_price, float $configured_amount, $field_value, int $quantity)
	{
		$calculated = ($base_price * $configured_amount) / 100.0;
		optionbay_log("PercentageStrategy: Calculated {$calculated} (({$base_price} * {$configured_amount}) / 100)", 'DEBUG');
		
		return $calculated;
	}
}
