<?php

namespace OptionBay\Helper;

// Exit if accessed directly.
if (!defined('ABSPATH')) {
	exit;
}

/**
 * Condition Evaluator
 *
 * Server-side evaluation of conditional logic rules to ensure accurate
 * validation and pricing when processing add-to-cart requests.
 *
 * @since      1.0.0
 * @package    OptionBay
 * @subpackage OptionBay/Helper
 */
class ConditionEvaluator
{
	/**
	 * Evaluate if a field should be visible (and thus processed/validated)
	 * based on its conditions and the submitted form data.
	 *
	 * @since 1.0.0
	 * @param array $field_schema   The schema of the field being evaluated.
	 * @param array $submitted_data The data submitted for this group ($_POST['optionbay_addons'][$group_id]).
	 * @return bool True if visible, false if hidden.
	 */
	public static function is_visible(array $field_schema, array $submitted_data): bool
	{
		$conditions = $field_schema['conditions'] ?? array();

		// If conditions are not active, it's always visible
		if (empty($conditions['status']) || $conditions['status'] !== 'active') {
			return true;
		}

		$rules = $conditions['rules'] ?? array();
		if (empty($rules)) {
			// If active but no rules, default to visible or hidden?
			// Let's assume visible if action is hide, hidden if action is show.
			return ($conditions['action'] ?? 'show') === 'hide';
		}

		$results = array();
		foreach ($rules as $rule) {
			$results[] = self::evaluate_rule($rule, $submitted_data);
		}

		$match = $conditions['match'] ?? 'ALL';
		$condition_met = false;

		if ($match === 'ALL') {
			$condition_met = !in_array(false, $results, true);
		} else { // ANY
			$condition_met = in_array(true, $results, true);
		}

		$action = $conditions['action'] ?? 'show';
		if ($action === 'show') {
			return $condition_met;
		} else { // hide
			return !$condition_met;
		}
	}

	/**
	 * Evaluate a single rule against the submitted data.
	 *
	 * @since 1.0.0
	 * @param array $rule
	 * @param array $submitted_data
	 * @return bool
	 */
	private static function evaluate_rule(array $rule, array $submitted_data): bool
	{
		$target_id = $rule['target_field_id'] ?? '';
		if (empty($target_id)) {
			return false;
		}

		$target_value = $submitted_data[$target_id] ?? '';
		$rule_value = $rule['value'] ?? '';
		$op = $rule['operator'] ?? '==';

		// Handle array values (e.g. multi-checkbox)
		if (is_array($target_value)) {
			switch ($op) {
				case '==':
					return in_array($rule_value, $target_value, true);
				case '!=':
					return !in_array($rule_value, $target_value, true);
				case 'contains':
					return in_array($rule_value, $target_value, true);
				case 'not_contains':
					return !in_array($rule_value, $target_value, true);
				case 'empty':
					return empty($target_value);
				case 'not_empty':
					return !empty($target_value);
				default:
					return false;
			}
		}

		// String/number comparison
		$target_value = (string) $target_value;
		$rule_value = (string) $rule_value;

		switch ($op) {
			case '==':
				return $target_value === $rule_value;
			case '!=':
				return $target_value !== $rule_value;
			case '>':
				return floatval($target_value) > floatval($rule_value);
			case '<':
				return floatval($target_value) < floatval($rule_value);
			case '>=':
				return floatval($target_value) >= floatval($rule_value);
			case '<=':
				return floatval($target_value) <= floatval($rule_value);
			case 'contains':
				return strpos($target_value, $rule_value) !== false;
			case 'not_contains':
				return strpos($target_value, $rule_value) === false;
			case 'empty':
				return $target_value === '';
			case 'not_empty':
				return $target_value !== '';
			default:
				return false;
		}
	}
}
