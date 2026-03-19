<?php

namespace OptionBay\Fields;

if (!defined('ABSPATH')) {
	exit;
}

/**
 * Number field type (with min/max/step).
 *
 * @since 1.0.0
 */
class NumberField extends BaseField
{
	protected function render_input(): string
	{
		$attrs = array(
			'type'  => 'number',
			'id'    => $this->get_html_id(),
			'name'  => $this->get_name(),
			'class' => 'ob-input ob-input--number',
		);

		$placeholder = $this->get('placeholder');
		if (!empty($placeholder)) {
			$attrs['placeholder'] = esc_attr($placeholder);
		}

		if ($this->get('required')) {
			$attrs['required'] = 'required';
		}

		$min = $this->get('min_value');
		if ($min !== '' && $min !== null) {
			$attrs['min'] = floatval($min);
		}

		$max = $this->get('max_value');
		if ($max !== '' && $max !== null) {
			$attrs['max'] = floatval($max);
		}

		$step = $this->get('step', 1);
		$attrs['step'] = floatval($step);

		$attr_string = '';
		foreach ($attrs as $key => $val) {
			$attr_string .= sprintf(' %s="%s"', esc_attr($key), esc_attr($val));
		}

		return '<input' . $attr_string . ' />';
	}

	public function validate($value)
	{
		$result = parent::validate($value);
		if (is_wp_error($result)) {
			return $result;
		}

		if (!$this->is_empty_value($value)) {
			$num = floatval($value);
			$min = $this->get('min_value');
			$max = $this->get('max_value');

			if ($min !== '' && $min !== null && $num < floatval($min)) {
				return new \WP_Error(
					'min_value',
					sprintf(
						__('%s must be at least %s.', 'optionbay'),
						$this->get('label', $this->get('id')),
						$min
					)
				);
			}
			if ($max !== '' && $max !== null && $num > floatval($max)) {
				return new \WP_Error(
					'max_value',
					sprintf(
						__('%s must be at most %s.', 'optionbay'),
						$this->get('label', $this->get('id')),
						$max
					)
				);
			}
		}

		return true;
	}

	public function sanitize($value)
	{
		if ($this->is_empty_value($value)) {
			return '';
		}
		return floatval($value);
	}
}
