<?php

namespace OptionBay\Pricing;

// Exit if accessed directly.
if (!defined('ABSPATH')) {
	exit;
}

/**
 * Pricing Engine
 *
 * Resolves the correct pricing strategy and executes it.
 *
 * @since      1.0.0
 * @package    OptionBay
 * @subpackage OptionBay/Pricing
 */
class PricingEngine
{
	/**
	 * Map of string types to Strategy classes.
	 *
	 * @var array
	 */
	private static $strategies = array(
		'flat'                => FlatFeeStrategy::class,
		'percentage'          => PercentageStrategy::class,
		'character_count'     => CharacterCountStrategy::class,
		'quantity_multiplier' => QuantityMultiplierStrategy::class,
	);

	/**
	 * Get the strategy instance.
	 *
	 * @param string $type
	 * @return PricingStrategy
	 */
	public static function get_strategy(string $type): PricingStrategy
	{
		$type = $type ?: 'flat';
		
		if (!array_key_exists($type, self::$strategies)) {
			$type = 'flat';
		}

		$class = self::$strategies[$type];
		return new $class();
	}

	/**
	 * Calculate the price for a field.
	 *
	 * @param string $type The price type (e.g. 'flat', 'percentage')
	 * @param float  $base_price Product base price
	 * @param float  $configured_amount Amount from schema
	 * @param mixed  $field_value Submitted value
	 * @param int    $quantity Cart item quantity
	 * @return float
	 */
	public static function calculate(string $type, float $base_price, float $configured_amount, $field_value, int $quantity): float
	{
		if ($type === 'none' || $configured_amount == 0) {
			return 0.0;
		}

		$strategy = self::get_strategy($type);
		return $strategy->calculate($base_price, $configured_amount, $field_value, $quantity);
	}
}
