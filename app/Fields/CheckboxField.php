<?php

namespace OptionBay\Fields;

if (!defined('ABSPATH')) {
	exit;
}

/**
 * Checkbox field type.
 *
 * Supports two modes:
 * - Single checkbox (toggle): no options defined, value is "1" or ""
 * - Multi-checkbox: options defined, value is array of selected option values
 *
 * @since 1.0.0
 */
class CheckboxField extends BaseField
{
	protected function render_input(): string
	{
		$options = $this->get('options', array());

		// Single toggle checkbox (no options)
		if (empty($options)) {
			$required = $this->get('required') ? ' required="required"' : '';
			return sprintf(
				'<label class="ob-checkbox-single"><input type="checkbox" id="%s" name="%s" value="1" class="ob-input ob-input--checkbox"%s /> %s</label>',
				$this->get_html_id(),
				$this->get_name(),
				$required,
				esc_html($this->get('label'))
			);
		}

		// Multi-checkbox (with options)
		$html = '<div class="ob-checkbox-group">';
		$name = $this->get_name() . '[]'; // Array name for multi-select

		foreach ($options as $i => $option) {
			$option_id = $this->get_html_id() . '-' . $i;
			$price_attr = '';
			$price = floatval($option['price'] ?? 0);
			if ($price > 0) {
				$price_attr = sprintf(
					' data-price-type="%s" data-price="%s"',
					esc_attr($option['price_type'] ?? 'flat'),
					esc_attr($price)
				);
			}
			$weight = floatval($option['weight'] ?? 0);
			if ($weight > 0) {
				$price_attr .= sprintf(' data-weight="%s"', esc_attr($weight));
			}

			$html .= sprintf(
				'<label class="ob-checkbox-option" for="%s"><input type="checkbox" id="%s" name="%s" value="%s" class="ob-input ob-input--checkbox"%s /> %s</label>',
				$option_id,
				$option_id,
				$name,
				esc_attr($option['value'] ?? ''),
				$price_attr,
				esc_html($option['label'] ?? '')
			);
		}

		$html .= '</div>';
		return $html;
	}

	public function validate($value)
	{
		$result = parent::validate($value);
		if (is_wp_error($result)) {
			return $result;
		}

		// Validate multi-checkbox against allowed options
		$options = $this->get('options', array());
		if (!empty($options) && is_array($value)) {
			$allowed = array_column($options, 'value');
			foreach ($value as $v) {
				if (!in_array($v, $allowed, true)) {
					return new \WP_Error(
						'invalid_option',
						sprintf(
							__('Invalid selection for %s.', 'optionbay'),
							$this->get('label', $this->get('id'))
						)
					);
				}
			}
		}

		return true;
	}

	public function sanitize($value)
	{
		if (is_array($value)) {
			return array_map('sanitize_text_field', $value);
		}
		return sanitize_text_field($value);
	}

	public function get_display_value($value): string
	{
		$options = $this->get('options', array());

		// Single toggle
		if (empty($options)) {
			return $value ? __('Yes', 'optionbay') : __('No', 'optionbay');
		}

		// Multi-checkbox
		if (!is_array($value)) {
			$value = array($value);
		}

		$labels = array();
		foreach ($options as $option) {
			if (in_array($option['value'] ?? '', $value, true)) {
				$labels[] = $option['label'] ?? $option['value'];
			}
		}
		return esc_html(implode(', ', $labels));
	}

	public function get_weight($value): float
	{
		$options = $this->get('options', array());
		if (empty($options)) {
			return $value ? floatval($this->get('weight', 0)) : 0.0;
		}

		if (!is_array($value)) {
			$value = array($value);
		}

		$total = 0.0;
		foreach ($options as $option) {
			if (in_array($option['value'] ?? '', $value, true)) {
				$total += floatval($option['weight'] ?? 0);
			}
		}
		return $total;
	}
}
