<?php

namespace OptionBay\Fields;

if (!defined('ABSPATH')) {
	exit;
}

/**
 * Text field type (single line input).
 *
 * @since 1.0.0
 */
class TextField extends BaseField
{
	protected function render_input(): string
	{
		$attrs = array(
			'type'  => 'text',
			'id'    => $this->get_html_id(),
			'name'  => $this->get_name(),
			'class' => 'ob-input ob-input--text',
		);

		$placeholder = $this->get('placeholder');
		if (!empty($placeholder)) {
			$attrs['placeholder'] = esc_attr($placeholder);
		}

		if ($this->get('required')) {
			$attrs['required'] = 'required';
		}

		$max_length = $this->get('max_length', 0);
		if ($max_length > 0) {
			$attrs['maxlength'] = absint($max_length);
		}

		$min_length = $this->get('min_length', 0);
		if ($min_length > 0) {
			$attrs['minlength'] = absint($min_length);
		}

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
			$max = $this->get('max_length', 0);
			$min = $this->get('min_length', 0);
			$len = mb_strlen($value);

			if ($max > 0 && $len > $max) {
				return new \WP_Error(
					'max_length',
					sprintf(
						__('%s must be at most %d characters.', 'optionbay'),
						$this->get('label', $this->get('id')),
						$max
					)
				);
			}
			if ($min > 0 && $len < $min) {
				return new \WP_Error(
					'min_length',
					sprintf(
						__('%s must be at least %d characters.', 'optionbay'),
						$this->get('label', $this->get('id')),
						$min
					)
				);
			}
		}

		return true;
	}
}
