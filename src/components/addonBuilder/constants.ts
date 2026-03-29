import { __ } from "@wordpress/i18n";

export const FIELD_TYPES = [
  { value: "text", label: __("Text", "optionbay") },
  { value: "textarea", label: __("Textarea", "optionbay") },
  { value: "select", label: __("Dropdown", "optionbay") },
  { value: "checkbox", label: __("Checkbox", "optionbay") },
  { value: "radio", label: __("Radio Buttons", "optionbay") },
  { value: "number", label: __("Number", "optionbay") },
  { value: "file", label: __("File Upload", "optionbay") },
];

export const PRICE_TYPES = [
  { value: "none", label: __("No Price", "optionbay") },
  { value: "flat", label: __("Flat Fee", "optionbay") },
  { value: "percentage", label: __("Percentage of Base", "optionbay") },
  { value: "character_count", label: __("Per Character", "optionbay") },
  { value: "quantity_multiplier", label: __("× Quantity", "optionbay") },
];
