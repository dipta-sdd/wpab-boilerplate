<?php

namespace OptionBay\Fields;

if (!defined('ABSPATH')) {
	exit;
}

/**
 * Select (dropdown) field type.
 *
 * @since 1.0.0
 */
class SelectField extends BaseField
{
	protected function render_input(): string
	{
		$required = $this->get('required') ? ' required="required"' : '';
		$options = $this->get('options', array());

		$html = sprintf(
			'<select id="%s" name="%s" class="ob-input ob-input--select"%s>',
			$this->get_html_id(),
			$this->get_name(),
			$required
		);

		// Placeholder option
		$placeholder = $this->get('placeholder');
		if (!empty($placeholder)) {
			$html .= sprintf('<option value="">%s</option>', esc_html($placeholder));
		} else {
			$html .= sprintf('<option value="">%s</option>', esc_html__('Choose an option...', 'optionbay'));
		}

		foreach ($options as $option) {
			$price_attr = '';
			$price_type = $option['price_type'] ?? 'flat';
			$price = floatval($option['price'] ?? 0);
			if ($price > 0) {
				$price_attr = sprintf(
					' data-price-type="%s" data-price="%s"',
					esc_attr($price_type),
					esc_attr($price)
				);
			}
			$weight = floatval($option['weight'] ?? 0);
			if ($weight > 0) {
				$price_attr .= sprintf(' data-weight="%s"', esc_attr($weight));
			}

			$html .= sprintf(
				'<option value="%s"%s>%s</option>',
				esc_attr($option['value'] ?? ''),
				$price_attr,
				esc_html($option['label'] ?? '')
			);
		}

		$html .= '</select>';
		return $html;
	}

	public function validate($value)
	{
		$result = parent::validate($value);
		if (is_wp_error($result)) {
			return $result;
		}

		// Validate against allowed options
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
