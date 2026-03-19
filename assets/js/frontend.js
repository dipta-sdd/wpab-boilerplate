/**
 * OptionBay Frontend Interactivity Engine
 *
 * Handles conditional logic evaluation, live price calculation,
 * and file upload pre-validation on WooCommerce product pages.
 *
 * Uses event delegation on form.cart for performance.
 * jQuery is available since WordPress provides it.
 *
 * @since 1.0.0
 */
(function ($) {
  "use strict";

  // Bail if no schema data was hydrated by PHP
  if (typeof window.optionBaySchema === "undefined") {
    return;
  }

  var OB = window.optionBaySchema;
  var schemas = OB.schemas || {};
  var basePrice = parseFloat(OB.basePrice) || 0;

  // ─── Conditional Logic Engine ────────────────────────────────────

  /**
   * Get the current value of a field by its field ID.
   */
  function getFieldValue(groupId, fieldId) {
    var $wrapper = $(
      '.ob-field[data-group-id="' +
        groupId +
        '"][data-field-id="' +
        fieldId +
        '"]'
    );
    if (!$wrapper.length) return "";

    var $input = $wrapper.find("input, select, textarea").first();
    if (!$input.length) return "";

    var type = $input.attr("type");

    // Checkbox group (multi)
    if (type === "checkbox") {
      var $checkboxes = $wrapper.find('input[type="checkbox"]');
      if ($checkboxes.length > 1) {
        var vals = [];
        $checkboxes.filter(":checked").each(function () {
          vals.push($(this).val());
        });
        return vals;
      }
      // Single toggle
      return $input.is(":checked") ? $input.val() : "";
    }

    // Radio
    if (type === "radio") {
      return $wrapper.find('input[type="radio"]:checked').val() || "";
    }

    return $input.val() || "";
  }

  /**
   * Evaluate a single condition rule.
   */
  function evaluateRule(rule, groupId) {
    var targetValue = getFieldValue(groupId, rule.target_field_id);
    var ruleValue = rule.value;
    var op = rule.operator;

    // Array handling for checkbox multi
    if (Array.isArray(targetValue)) {
      switch (op) {
        case "==":
          return targetValue.indexOf(ruleValue) !== -1;
        case "!=":
          return targetValue.indexOf(ruleValue) === -1;
        case "contains":
          return targetValue.indexOf(ruleValue) !== -1;
        case "not_contains":
          return targetValue.indexOf(ruleValue) === -1;
        case "empty":
          return targetValue.length === 0;
        case "not_empty":
          return targetValue.length > 0;
        default:
          return false;
      }
    }

    // String/number comparison
    switch (op) {
      case "==":
        return String(targetValue) === String(ruleValue);
      case "!=":
        return String(targetValue) !== String(ruleValue);
      case ">":
        return parseFloat(targetValue) > parseFloat(ruleValue);
      case "<":
        return parseFloat(targetValue) < parseFloat(ruleValue);
      case ">=":
        return parseFloat(targetValue) >= parseFloat(ruleValue);
      case "<=":
        return parseFloat(targetValue) <= parseFloat(ruleValue);
      case "contains":
        return String(targetValue).indexOf(String(ruleValue)) !== -1;
      case "not_contains":
        return String(targetValue).indexOf(String(ruleValue)) === -1;
      case "empty":
        return (
          targetValue === "" || targetValue === null || targetValue === undefined
        );
      case "not_empty":
        return (
          targetValue !== "" && targetValue !== null && targetValue !== undefined
        );
      default:
        return false;
    }
  }

  /**
   * Evaluate all conditional logic for a group.
   * Toggles visibility and clears hidden field values.
   */
  function evaluateConditions(groupId) {
    var groupData = schemas[groupId];
    if (!groupData || !groupData.fields) return;

    $.each(groupData.fields, function (_, field) {
      var conditions = field.conditions;
      if (!conditions || conditions.status !== "active") return;

      var rules = conditions.rules || [];
      if (rules.length === 0) return;

      // Evaluate rules
      var results = $.map(rules, function (rule) {
        return evaluateRule(rule, groupId);
      });

      // Apply match strategy
      var match = conditions.match || "ALL";
      var conditionMet;
      if (match === "ALL") {
        conditionMet = results.every(function (r) {
          return r === true;
        });
      } else {
        conditionMet = results.some(function (r) {
          return r === true;
        });
      }

      // Determine visibility based on action
      var action = conditions.action || "show";
      var shouldShow =
        action === "show" ? conditionMet : !conditionMet;

      var $field = $(
        '.ob-field[data-group-id="' +
          groupId +
          '"][data-field-id="' +
          field.id +
          '"]'
      );

      if (shouldShow) {
        $field.removeClass("ob-hidden");
      } else {
        $field.addClass("ob-hidden");
        // Clear values of hidden fields
        $field.find("input, select, textarea").each(function () {
          var $el = $(this);
          if ($el.is(":checkbox") || $el.is(":radio")) {
            $el.prop("checked", false);
          } else {
            $el.val("");
          }
        });
      }
    });
  }

  // ─── Live Pricing Engine ─────────────────────────────────────────

  /**
   * Calculate total addon price for all visible, selected fields.
   */
  function calculatePricing() {
    var addonTotal = 0;

    $.each(schemas, function (groupId, groupData) {
      if (!groupData.fields) return;

      $.each(groupData.fields, function (_, field) {
        var $wrapper = $(
          '.ob-field[data-group-id="' +
            groupId +
            '"][data-field-id="' +
            field.id +
            '"]'
        );

        // Skip hidden fields
        if (!$wrapper.length || $wrapper.hasClass("ob-hidden")) return;

        var value = getFieldValue(groupId, field.id);
        if (isEmptyValue(value)) return;

        // Check if field has options (select/radio/checkbox)
        if (field.options && field.options.length > 0) {
          addonTotal += calculateOptionPrice(field, value);
        } else {
          addonTotal += calculateFieldPrice(field, value);
        }
      });
    });

    // Update live total display
    updatePriceDisplay(addonTotal);
  }

  /**
   * Calculate price for option-based fields (select/radio/checkbox)
   */
  function calculateOptionPrice(field, value) {
    var total = 0;
    var values = Array.isArray(value) ? value : [value];

    $.each(values, function (_, v) {
      $.each(field.options || [], function (_, opt) {
        if (opt.value === v && parseFloat(opt.price) > 0) {
          total += computePriceByType(
            opt.price_type || "flat",
            parseFloat(opt.price)
          );
        }
      });
    });

    return total;
  }

  /**
   * Calculate price for non-option fields (text, number, etc.)
   */
  function calculateFieldPrice(field, value) {
    var priceType = field.price_type || "none";
    var price = parseFloat(field.price) || 0;

    if (priceType === "none" || price === 0) return 0;

    if (priceType === "character_count") {
      return String(value).length * price;
    }

    return computePriceByType(priceType, price);
  }

  /**
   * Compute price based on type (flat, percentage, etc.)
   */
  function computePriceByType(type, amount) {
    switch (type) {
      case "flat":
        return amount;
      case "percentage":
        return (basePrice * amount) / 100;
      case "quantity_multiplier":
        var qty = parseInt($("input.qty").val()) || 1;
        return amount * qty;
      default:
        return amount;
    }
  }

  /**
   * Update the live total price display on the page.
   */
  function updatePriceDisplay(addonTotal) {
    var $totalEl = $(".optionbay-live-total");

    if (addonTotal > 0) {
      $totalEl.show();
      var formatted = formatPrice(addonTotal);
      $totalEl.find(".amount").html(formatted);
    } else {
      $totalEl.hide();
    }
  }

  /**
   * Format a price using WooCommerce settings from hydration data.
   */
  function formatPrice(price) {
    var decimals = OB.decimals || 2;
    var decSep = OB.decimalSep || ".";
    var thousandSep = OB.thousandSep || ",";
    var format = OB.priceFormat || "%1$s%2$s";
    var currency = OB.currency || "$";

    var fixed = price.toFixed(decimals);
    var parts = fixed.split(".");
    var intPart = parts[0].replace(
      /\B(?=(\d{3})+(?!\d))/g,
      thousandSep
    );
    var formatted = decimals > 0 ? intPart + decSep + parts[1] : intPart;

    return format.replace("%1$s", currency).replace("%2$s", formatted);
  }

  /**
   * Check if a value is empty.
   */
  function isEmptyValue(val) {
    if (val === null || val === undefined || val === "") return true;
    if (Array.isArray(val) && val.length === 0) return true;
    return false;
  }

  // ─── File Upload Pre-validation ──────────────────────────────────

  function validateFile(input) {
    var $input = $(input);
    var maxSize = parseInt($input.data("max-size")) || 5;
    var maxBytes = maxSize * 1024 * 1024;
    var accept = ($input.attr("accept") || "").split(",").map(function (s) {
      return s.trim().toLowerCase();
    });

    if (input.files && input.files[0]) {
      var file = input.files[0];

      // Size check
      if (file.size > maxBytes) {
        alert("File size exceeds " + maxSize + " MB limit.");
        $input.val("");
        return false;
      }

      // Extension check
      if (accept.length > 0 && accept[0] !== "") {
        var ext = "." + file.name.split(".").pop().toLowerCase();
        if (accept.indexOf(ext) === -1) {
          alert("File type not allowed. Allowed: " + accept.join(", "));
          $input.val("");
          return false;
        }
      }
    }

    return true;
  }

  // ─── Event Binding (Delegation) ──────────────────────────────────

  $(document).ready(function () {
    var $form = $("form.cart");
    if (!$form.length) return;

    // Delegated listener for all field changes
    $form.on("change input", ".ob-field input, .ob-field select, .ob-field textarea", function () {
      var $field = $(this).closest(".ob-field");
      var groupId = $field.data("group-id");

      // 1. Evaluate conditional logic for the group
      evaluateConditions(String(groupId));

      // 2. Recalculate pricing
      calculatePricing();
    });

    // File input validation
    $form.on("change", '.ob-input--file', function () {
      validateFile(this);
    });

    // Quantity change re-triggers pricing (for quantity_multiplier)
    $form.on("change input", "input.qty", function () {
      calculatePricing();
    });

    // Run initial evaluation
    $.each(schemas, function (groupId) {
      evaluateConditions(String(groupId));
    });
    calculatePricing();
  });
})(jQuery);
