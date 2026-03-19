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
	/**
	 * Calculate the character count pricing addition.
	 * 
	 * Returns a price directly proportional to the length of the string
	 * submitted by the customer.
	 * 
	 * @since 1.0.0
	 * @param float $base_price        Product base price.
	 * @param float $configured_amount Amount per character.
	 * @param mixed $field_value       The string value submitted.
	 * @param int   $quantity          Cart quantity.
	 * @return float Total cost for the characters entered.
	 */
	public function calculate(float $base_price, float $configured_amount, $field_value, int $quantity)
	{
		if (empty($field_value) || !is_string($field_value)) {
			optionbay_log("CharacterCountStrategy: Empty or non-string value. Adding 0.", 'DEBUG');
			return 0.0;
		}

		$length = mb_strlen((string) $field_value);
		$calculated = $length * $configured_amount;

		optionbay_log("CharacterCountStrategy: length {$length} * {$configured_amount} = {$calculated}", 'DEBUG');

		return $calculated;
	}
}
