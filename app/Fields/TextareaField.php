<?php

namespace OptionBay\Fields;

if (!defined('ABSPATH')) {
	exit;
}

/**
 * Textarea field type (multi-line input).
 *
 * @since 1.0.0
 */
class TextareaField extends BaseField
{
	protected function render_input(): string
	{
		$placeholder = esc_attr($this->get('placeholder'));
		$required = $this->get('required') ? ' required="required"' : '';
		$max_length = $this->get('max_length', 0);
		$maxlength_attr = $max_length > 0 ? sprintf(' maxlength="%d"', absint($max_length)) : '';

		return sprintf(
			'<textarea id="%s" name="%s" class="ob-input ob-input--textarea" rows="4" placeholder="%s"%s%s></textarea>',
			$this->get_html_id(),
			$this->get_name(),
			$placeholder,
			$required,
			$maxlength_attr
		);
	}

	public function sanitize($value)
	{
		return sanitize_textarea_field($value);
	}

	public function validate($value)
	{
		$result = parent::validate($value);
		if (is_wp_error($result)) {
			return $result;
		}

		if (!$this->is_empty_value($value)) {
			$max = $this->get('max_length', 0);
			if ($max > 0 && mb_strlen($value) > $max) {
				return new \WP_Error(
					'max_length',
					sprintf(
						__('%s must be at most %d characters.', 'optionbay'),
						$this->get('label', $this->get('id')),
						$max
					)
				);
			}
		}

		return true;
	}
}
