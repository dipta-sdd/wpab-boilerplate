<?php

namespace OptionBay\Pricing;

// Exit if accessed directly.
if (!defined('ABSPATH')) {
	exit;
}

/**
 * Character Count Strategy
 *
 * Multiplies the configured amount by the number of characters in the field value.
 *
 * @since      1.0.0
 * @package    OptionBay
 * @subpackage OptionBay/Pricing
 */
class CharacterCountStrategy implements PricingStrategy
{
	public function calculate(float $base_price, float $configured_amount, $field_value, int $quantity): float
	{
		if (empty($field_value) || !is_string($field_value)) {
			return 0.0;
		}

		$length = mb_strlen((string) $field_value);
		return $length * $configured_amount;
	}
}
