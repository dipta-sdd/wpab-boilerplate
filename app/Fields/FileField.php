<?php

namespace OptionBay\Fields;

if (!defined('ABSPATH')) {
	exit;
}

/**
 * File upload field type.
 *
 * Uses standard form submission (multipart/form-data) — no AJAX.
 * File processing happens in the cart pipeline (Stage 2).
 *
 * @since 1.0.0
 */
class FileField extends BaseField
{
	protected function render_input(): string
	{
		$allowed_types = $this->get('allowed_types', '.jpg,.png,.pdf');
		$max_file_size = absint($this->get('max_file_size', 5)); // MB
		$required = $this->get('required') ? ' required="required"' : '';

		return sprintf(
			'<input type="file" id="%s" name="%s" class="ob-input ob-input--file" accept="%s" data-max-size="%d"%s />
			<p class="ob-field__file-info">%s</p>',
			$this->get_html_id(),
			$this->get_name(),
			esc_attr($allowed_types),
			$max_file_size,
			$required,
			sprintf(
				/* translators: %1$s: allowed types, %2$d: max size in MB */
				esc_html__('Allowed: %1$s. Max size: %2$d MB.', 'optionbay'),
				esc_html($allowed_types),
				$max_file_size
			)
		);
	}

	public function validate($value)
	{
		// For file fields, $value is the $_FILES entry
		if ($this->get('required') && (empty($value) || empty($value['name']))) {
			return new \WP_Error(
				'required_field',
				sprintf(
					__('%s is required.', 'optionbay'),
					$this->get('label', $this->get('id'))
				)
			);
		}

		if (!empty($value) && !empty($value['name'])) {
			// Check file size
			$max_bytes = absint($this->get('max_file_size', 5)) * 1024 * 1024;
			if ($value['size'] > $max_bytes) {
				return new \WP_Error(
					'file_too_large',
					sprintf(
						__('%s exceeds the maximum file size of %d MB.', 'optionbay'),
						$this->get('label', $this->get('id')),
						$this->get('max_file_size', 5)
					)
				);
			}

			// Check MIME type
			$allowed = $this->get('allowed_types', '.jpg,.png,.pdf');
			$allowed_exts = array_map('trim', explode(',', $allowed));
			$ext = '.' . strtolower(pathinfo($value['name'], PATHINFO_EXTENSION));
			if (!in_array($ext, $allowed_exts, true)) {
				return new \WP_Error(
					'invalid_file_type',
					sprintf(
						__('%s: File type not allowed. Allowed: %s', 'optionbay'),
						$this->get('label', $this->get('id')),
						$allowed
					)
				);
			}
		}

		return true;
	}

	public function sanitize($value)
	{
		// File sanitization happens in the cart pipeline
		return $value;
	}

	public function get_display_value($value): string
	{
		if (is_string($value)) {
			return esc_html(basename($value));
		}
		if (is_array($value) && !empty($value['name'])) {
			return esc_html($value['name']);
		}
		return '';
	}
}
