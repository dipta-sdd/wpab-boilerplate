import { __ } from "@wordpress/i18n";

/**
 * Centralized tooltips for the Addon Builder field settings.
 * All help text strings are internationalized using __().
 */
export const FIELD_TOOLTIPS = {
  label: __("The name of the field shown to the customer on the product page.", "optionbay"),
  id: __("A unique identifier for this field, used for internal tracking and conditional logic.", "optionbay"),
  type: __("Choose the input method for the customer (e.g., text, dropdown, file upload).", "optionbay"),
  description: __("Additional instruction text displayed below the field input.", "optionbay"),
  placeholder: __("Hint text shown inside the input field while it's empty.", "optionbay"),
  required: __("Check this to make this field mandatory before customers can add the product to cart.", "optionbay"),
  class_name: __("Optional CSS class name to style this specific field container.", "optionbay"),
  price_type: __("Determine how this field affects the product price (flat fee, percentage, etc).", "optionbay"),
  price: __("The amount to add or subtract from the product price.", "optionbay"),
  weight: __("Set a custom weight for shipping calculations (if applicable).", "optionbay"),
  restrictions: __("Define constraints like minimum character count or numeric range.", "optionbay"),
  file_restrictions: __("Restrict file uploads by allowed extensions and maximum file size.", "optionbay"),
  choices: __("Manage the available options for this field. You can assign different prices to each choice.", "optionbay"),
  conditional_logic: __("Set rules that show or hide this field based on values of other fields.", "optionbay"),
};
