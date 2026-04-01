import { __ } from "@wordpress/i18n";

export const FIELD_TYPES = [
  { value: "text", label: __("Text Input", "optionbay") },
  { value: "textarea", label: __("Textarea", "optionbay") },
  { value: "select", label: __("Dropdown", "optionbay") },
  { value: "checkbox", label: __("Checkboxes", "optionbay") },
  { value: "radio", label: __("Radio Buttons", "optionbay") },
  { value: "number", label: __("Number", "optionbay") },
  { value: "file", label: __("File upload", "optionbay") },
  { value: "email", label: __("Email", "optionbay") },
  { value: "date", label: __("Date", "optionbay") },
  { value: "time", label: __("Time", "optionbay") },
];

export const PRICE_TYPES = [
  { value: "none", label: __("No Price", "optionbay") },
  { value: "flat", label: __("Flat Fee", "optionbay") },
  { value: "percentage", label: __("Percentage of Base", "optionbay") },
  { value: "character_count", label: __("Per Character", "optionbay") },
  { value: "quantity_multiplier", label: __("× Quantity", "optionbay") },
];
