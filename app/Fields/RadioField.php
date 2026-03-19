<?php

namespace OptionBay\Fields;

if (!defined('ABSPATH')) {
	exit;
}

/**
 * Radio button field type (single choice, inline display).
 *
 * @since 1.0.0
 */
class RadioField extends BaseField
{
	protected function render_input(): string
	{
		$options = $this->get('options', array());
		$required = $this->get('required') ? ' required="required"' : '';
		$html = '<div class="ob-radio-group">';
		$name = $this->get_name();

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
				'<label class="ob-radio-option" for="%s"><input type="radio" id="%s" name="%s" value="%s" class="ob-input ob-input--radio"%s%s /> %s</label>',
				$option_id,
				$option_id,
				$name,
				esc_attr($option['value'] ?? ''),
				$price_attr,
				$required,
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

		if (!$this->is_empty_value($value)) {
			$allowed = array_column($this->get('options', array()), 'value');
			if (!in_array($value, $allowed, true)) {
				return new \WP_Error(
					'invalid_option',
					sprintf(
						__('Invalid selection for %s.', 'optionbay'),
						$this->get('label', $this->get('id'))
					)
				);
			}
		}

		return true;
	}

	public function get_display_value($value): string
	{
		$options = $this->get('options', array());
		foreach ($options as $option) {
			if (($option['value'] ?? '') === $value) {
				return esc_html($option['label'] ?? $value);
			}
		}
		return esc_html((string) $value);
	}

	public function get_weight($value): float
	{
		$options = $this->get('options', array());
		foreach ($options as $option) {
			if (($option['value'] ?? '') === $value) {
				return floatval($option['weight'] ?? 0);
			}
		}
		return 0.0;
	}
}
