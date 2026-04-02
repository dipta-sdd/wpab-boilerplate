<?php
/**
 * Checkbox Field — Field type for toggles and multi-checkboxes.
 *
 * @since      1.0.0
 * @package    OptionBay
 * @subpackage OptionBay/Fields
 */

namespace OptionBay\Fields;

if ( ! defined( 'ABSPATH' ) ) {
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
class CheckboxField extends BaseField {

	/**
	 * Render the checkbox input array or single toggle element.
	 *
	 * Determines rendering logic based on whether choices were supplied
	 * in the OptionBay schema. Adds `data-price` properties on an
	 * individual element basis for JS evaluation.
	 *
	 * @since 1.0.0
	 * @return string The escaped HTML markup.
	 */
	protected function render_input() {
		$options = $this->get( 'options', array() );

		// Single toggle checkbox (no options)
		if ( empty( $options ) ) {
			$required = $this->get( 'required' ) ? ' required="required"' : '';
			return sprintf(
				'<label class="ob-checkbox-single"><input type="checkbox" id="%s" name="%s" value="1" class="ob-input ob-input--checkbox"%s /> %s</label>',
				$this->get_html_id(),
				$this->get_name(),
				$required,
				esc_html( $this->get( 'label' ) )
			);
		}

		// Multi-checkbox (with options)
		$html = '<div class="ob-checkbox-group">';
		$name = $this->get_name() . 'array()'; // Array name for multi-select

		foreach ( $options as $i => $option ) {
			$option_id  = $this->get_html_id() . '-' . $i;
			$price_attr = '';
			$price      = floatval( $option['price'] ?? 0 );
			if ( $price > 0 ) {
				$price_attr = sprintf(
					' data-price-type="%s" data-price="%s"',
					esc_attr( $option['price_type'] ?? 'flat' ),
					esc_attr( $price )
				);
			}
			$weight = floatval( $option['weight'] ?? 0 );
			if ( $weight > 0 ) {
				$price_attr .= sprintf( ' data-weight="%s"', esc_attr( $weight ) );
			}

			$html .= sprintf(
				'<label class="ob-checkbox-option" for="%s"><input type="checkbox" id="%s" name="%s" value="%s" class="ob-input ob-input--checkbox"%s /> %s</label>',
				$option_id,
				$option_id,
				$name,
				esc_attr( $option['value'] ?? '' ),
				$price_attr,
				esc_html( $option['label'] ?? '' )
			);
		}

		$html .= '</div>';
		return $html;
	}

	/**
	 * Validate the submitted array of checkboxes or the single toggle value.
	 *
	 * Inherits basic requirement checks from BaseField and adds security
	 * checks against forged option values.
	 *
	 * @since 1.0.0
	 * @param mixed $value The string or array of strings submitted.
	 * @return true|\WP_Error True if validation passed, WP_Error object otherwise.
	 */
	public function validate( $value ) {
		$result = parent::validate( $value );
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		// Validate multi-checkbox against allowed options
		$options = $this->get( 'options', array() );
		if ( ! empty( $options ) && is_array( $value ) ) {
			$allowed = array_column( $options, 'value' );
			foreach ( $value as $v ) {
				if ( ! in_array( $v, $allowed, true ) ) {
					optionbay_log( "CheckboxField Validation: Submited value '{$v}' not in allowed set.", 'WARNING' );
					return new \WP_Error(
						'invalid_option',
						sprintf(
							/* translators: %s: field label */
							__( 'Invalid selection for %s.', 'optionbay' ),
							$this->get( 'label', $this->get( 'id' ) )
						)
					);
				}
			}
		}

		return true;
	}

	/**
	 * Sanitize an array of strings or single value based on toggle setup.
	 *
	 * @since 1.0.0
	 * @param mixed $value The raw POST value.
	 * @return mixed Sanitized strings array or string.
	 */
	public function sanitize( $value ) {
		if ( is_array( $value ) ) {
			return array_map( 'sanitize_text_field', $value );
		}
		return sanitize_text_field( $value );
	}

	/**
	 * Get the human-readable labels for the selected checkbox values.
	 *
	 * @since 1.0.0
	 * @param mixed $value The selected value(s).
	 * @return string Comma-separated labels.
	 */
	public function get_display_value( $value ) {
		$options = $this->get( 'options', array() );

		// Single toggle
		if ( empty( $options ) ) {
			return $value ? __( 'Yes', 'optionbay' ) : __( 'No', 'optionbay' );
		}

		// Multi-checkbox
		if ( ! is_array( $value ) ) {
			$value = array( $value );
		}

		$labels = array();
		foreach ( $options as $option ) {
			if ( in_array( $option['value'] ?? '', $value, true ) ) {
				$labels[] = $option['label'] ?? $option['value'];
			}
		}
		return esc_html( implode( ', ', $labels ) );
	}

	/**
	 * Compute cumulative shipping weight for a multi-select field.
	 *
	 * @since 1.0.0
	 * @param mixed $value User selection(s).
	 * @return float Computed aggregate weight delta.
	 */
	public function get_weight( $value ) {
		$options = $this->get( 'options', array() );
		if ( empty( $options ) ) {
			return $value ? floatval( $this->get( 'weight', 0 ) ) : 0.0;
		}

		if ( ! is_array( $value ) ) {
			$value = array( $value );
		}

		$total = 0.0;
		foreach ( $options as $option ) {
			if ( in_array( $option['value'] ?? '', $value, true ) ) {
				$total += floatval( $option['weight'] ?? 0 );
			}
		}
		return $total;
	}
}
