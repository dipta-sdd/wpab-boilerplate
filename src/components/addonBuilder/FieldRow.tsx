import React from "react";
import { __ } from "@wordpress/i18n";
import { Draggable } from "@hello-pangea/dnd";
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  Minus,
  ChevronsUpDown,
  Menu,
} from "lucide-react";
import {
  ClassicButton,
  ClassicInput,
  ClassicSelect,
  ClassicCheckbox,
} from "../classics";
import { ClassicSettingsTable } from "../classics/ClassicSettingsTable";
import {
  useAddonContext,
  getDefaultField,
  FieldDefinition,
} from "../../store/AddonContext";
import { Tooltip } from "../common/ToolTip";
import { FIELD_TYPES, PRICE_TYPES } from "./constants";
import { FIELD_TOOLTIPS } from "./tooltips";
import { FormError } from "./FormError";
import { OptionEditor } from "./OptionEditor";
import { ConditionEditor } from "./ConditionEditor";

interface FieldRowProps {
  field: FieldDefinition;
  index: number;
}

export const FieldRow: React.FC<FieldRowProps> = ({ field, index }) => {
  const { state, dispatch } = useAddonContext();
  const isExpanded = state.expandedFieldId === field.id;
  const hasOptions = ["select", "radio", "checkbox"].includes(field.type);

  const update = (updates: Partial<FieldDefinition>) => {
    dispatch({ type: "UPDATE_FIELD", payload: { id: field.id, updates } });
  };

  return (
    <Draggable draggableId={field.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="optionbay-w-full optionbay-border-b optionbay-border-[#dcdcde]"
          style={{ ...provided.draggableProps.style }}
        >
          <div
            onClick={() =>
              dispatch({ type: "TOGGLE_EXPAND_FIELD", payload: field.id })
            }
            className={`optionbay-flex optionbay-items-center optionbay-py-3 optionbay-px-4 optionbay-bg-white hover:optionbay-bg-[#f9f9f9] optionbay-transition-colors optionbay-cursor-pointer optionbay-group ${
              snapshot.isDragging ? "optionbay-shadow-md" : ""
            }`}
          >
            {/* Col 1: Drag Handle */}
            <div
              className="optionbay-w-10"
              onClick={(e) => e.stopPropagation()}
            >
              <span
                {...provided.dragHandleProps}
                className="optionbay-cursor-grab active:optionbay-cursor-grabbing optionbay-text-[#9ca3af] optionbay-text-[18px] optionbay-flex optionbay-items-center"
                title={__("Drag to reorder", "optionbay")}
              >
                <Menu size={18} />
              </span>
            </div>

            {/* Col 2: Name (Label) */}
            <div className="optionbay-flex-1">
              <span className="optionbay-text-[#2271b1] hover:optionbay-text-[#135e96] optionbay-font-semibold optionbay-text-[14px]">
                {field.label || __("(No name)", "optionbay")}
                {field.required && (
                  <span className="optionbay-text-[#c00] optionbay-ml-1">*</span>
                )}
              </span>

              {/* Hover Actions (WordPress style) */}
              <div className="optionbay-row-actions optionbay-text-[12px] optionbay-flex optionbay-gap-1 optionbay-opacity-0 group-hover:optionbay-opacity-100 optionbay-transition-opacity">
                <span className="optionbay-text-[#2271b1] hover:optionbay-underline" onClick={(e) => {
                  e.stopPropagation();
                  dispatch({ type: "TOGGLE_EXPAND_FIELD", payload: field.id });
                }}>
                  {__("Edit field", "optionbay")}
                </span>
                <span className="optionbay-text-[#ddd]">|</span>
                <span className="optionbay-text-[#2271b1] hover:optionbay-underline" onClick={(e) => {
                  e.stopPropagation();
                  dispatch({ type: "DUPLICATE_FIELD", payload: field.id });
                }}>
                  {__("Duplicate", "optionbay")}
                </span>
                <span className="optionbay-text-[#ddd]">|</span>
                <span className="optionbay-text-[#d63638] hover:optionbay-text-[#b32d2e] hover:optionbay-underline" onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(__("Are you sure you want to remove this field?", "optionbay"))) {
                    dispatch({ type: "REMOVE_FIELD", payload: field.id });
                  }
                }}>
                  {__("Delete", "optionbay")}
                </span>
              </div>
            </div>

            {/* Col 3: Type */}
            <div className="optionbay-w-1/3">
              <span className="optionbay-text-[#646970] optionbay-text-[13px]">
                {FIELD_TYPES.find((t) => t.value === field.type)?.label ||
                  field.type}
              </span>
            </div>

            {/* Col 4: Actions */}
            <div className="optionbay-w-32 optionbay-flex optionbay-justify-end optionbay-gap-1 optionbay-items-center">
              {/* Move Up */}
              <Tooltip
                content={__("Move up", "optionbay")}
                disabled={index === 0}
              >
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch({ type: "MOVE_UP", payload: index });
                  }}
                  className={`optionbay-bg-transparent optionbay-border-none optionbay-cursor-pointer optionbay-p-1 optionbay-flex optionbay-items-center optionbay-transition-colors ${
                    index === 0
                      ? "optionbay-text-[#ccd0d4] optionbay-cursor-not-allowed"
                      : "optionbay-text-[#646970] hover:optionbay-text-[#2271b1]"
                  }`}
                >
                  <ChevronUp size={16} />
                </button>
              </Tooltip>

              {/* Move Down */}
              <Tooltip
                content={__("Move down", "optionbay")}
                disabled={index === state.schema.length - 1}
              >
                <button
                  type="button"
                  disabled={index === state.schema.length - 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch({ type: "MOVE_DOWN", payload: index });
                  }}
                  className={`optionbay-bg-transparent optionbay-border-none optionbay-cursor-pointer optionbay-p-1 optionbay-flex optionbay-items-center optionbay-transition-colors ${
                    index === state.schema.length - 1
                      ? "optionbay-text-[#ccd0d4] optionbay-cursor-not-allowed"
                      : "optionbay-text-[#646970] hover:optionbay-text-[#2271b1]"
                  }`}
                >
                  <ChevronDown size={16} />
                </button>
              </Tooltip>

              {/* Delete Field */}
              <Tooltip content={__("Delete field", "optionbay")}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (
                      confirm(
                        __(
                          "Are you sure you want to remove this field?",
                          "optionbay",
                        ),
                      )
                    ) {
                      dispatch({ type: "REMOVE_FIELD", payload: field.id });
                    }
                  }}
                  className="optionbay-bg-transparent optionbay-border-none optionbay-cursor-pointer optionbay-p-1 optionbay-flex optionbay-items-center optionbay-text-[#d63638] hover:optionbay-text-[#b32d2e] optionbay-transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </Tooltip>
            </div>
          </div>

          {/* Body */}
          {isExpanded && (
            <div className="optionbay-pl-4">
              <ClassicSettingsTable
                className=""
                fields={[
                  {
                    label: __("Field Type", "optionbay"),
                    tooltip: FIELD_TOOLTIPS.type,
                    render: () => (
                      <ClassicSelect
                      differentDropdownWidth
                        value={field.type}
                        classNames={{
                          innerContainer: "!optionbay-w-[120px]",
                        }}
                        onChange={(val) => {
                          const newType = String(val);
                          const defaults = getDefaultField(newType);
                          update({
                            type: newType,
                            options: defaults.options,
                            min_length: defaults.min_length,
                            max_length: defaults.max_length,
                            min_value: defaults.min_value,
                            max_value: defaults.max_value,
                            step: defaults.step,
                            allowed_types: defaults.allowed_types,
                            max_file_size: defaults.max_file_size,
                          });
                        }}
                        options={FIELD_TYPES.map((ft) => ({
                          value: ft.value,
                          label: ft.label,
                        }))}
                      />
                    ),
                  },
                  {
                    label: __("Label", "optionbay"),
                    tooltip: FIELD_TOOLTIPS.label,
                    render: () => (
                      <>
                        <ClassicInput
                          size="regular"
                          value={field.label}
                          onChange={(e) => update({ label: e.target.value })}
                          placeholder={__("Enter field label", "optionbay")}
                        />
                        <FormError
                          message={state.errors?.[`schema.${index}.label`]}
                        />
                      </>
                    ),
                  },
                  {
                    label: __("Description", "optionbay"),
                    tooltip: FIELD_TOOLTIPS.description,
                    render: () => (
                      <>
                        <textarea
                          className="large-text optionbay-p-1.5"
                          rows={2}
                          value={field.description}
                          onChange={(e) =>
                            update({ description: e.target.value })
                          }
                          placeholder={__(
                            "Help text shown below the field",
                            "optionbay",
                          )}
                        />
                        <FormError
                          message={
                            state.errors?.[`schema.${index}.description`]
                          }
                        />
                      </>
                    ),
                  },
                  {
                    label: __("Validation", "optionbay"),
                    tooltip: FIELD_TOOLTIPS.required,
                    render: () => (
                      <>
                        <ClassicCheckbox
                          label={__("Required Field", "optionbay")}
                          checked={field.required}
                          onChange={(checked) => update({ required: checked })}
                        />
                        <FormError
                          message={state.errors?.[`schema.${index}.required`]}
                        />
                      </>
                    ),
                  },
                  ...(["text", "textarea", "number"].includes(field.type)
                    ? [
                        {
                          label: __("Placeholder", "optionbay"),
                          tooltip: FIELD_TOOLTIPS.placeholder,
                          render: () => (
                            <>
                              <ClassicInput
                                size="regular"
                                value={field.placeholder}
                                onChange={(e) =>
                                  update({ placeholder: e.target.value })
                                }
                                placeholder={__(
                                  "Optional placeholder text",
                                  "optionbay",
                                )}
                              />
                              <FormError
                                message={
                                  state.errors?.[`schema.${index}.placeholder`]
                                }
                              />
                            </>
                          ),
                        },
                      ]
                    : []),
                  ...(!hasOptions
                    ? [
                        {
                          label: __("Pricing Logic", "optionbay"),
                          tooltip: FIELD_TOOLTIPS.price_type,
                          render: () => (
                            <>
                              <ClassicSelect
                              differentDropdownWidth
                                value={field.price_type}
                                onChange={(val) =>
                                  update({ price_type: String(val) })
                                }
                                options={PRICE_TYPES.map((pt) => ({
                                  value: pt.value,
                                  label: pt.label,
                                }))}
                              />
                              <FormError
                                message={
                                  state.errors?.[`schema.${index}.price_type`]
                                }
                              />
                            </>
                          ),
                        },
                        ...(field.price_type !== "none"
                          ? [
                              {
                                label: __("Price Amount", "optionbay"),
                                tooltip: FIELD_TOOLTIPS.price,
                                render: () => (
                                  <>
                                    <ClassicInput
                                      type="number"
                                      size="small"
                                      value={field.price || ""}
                                      onChange={(e) =>
                                        update({
                                          price:
                                            parseFloat(e.target.value) || 0,
                                        })
                                      }
                                      step="0.01"
                                      placeholder="0.00"
                                    />
                                    <FormError
                                      message={
                                        state.errors?.[`schema.${index}.price`]
                                      }
                                    />
                                  </>
                                ),
                              },
                            ]
                          : []),
                      ]
                    : []),
                  ...(["text", "textarea"].includes(field.type)
                    ? [
                        {
                          label: __("Restrictions", "optionbay"),
                          tooltip: FIELD_TOOLTIPS.restrictions,
                          render: () => (
                            <div className="optionbay-flex optionbay-flex-col optionbay-gap-1">
                              <div className="optionbay-flex optionbay-gap-2.5 optionbay-items-center">
                                <label className="optionbay-text-xs">
                                  {__("Min Length:", "optionbay")}{" "}
                                  <ClassicInput
                                    type="number"
                                    size="small"
                                    value={field.min_length || ""}
                                    onChange={(e) =>
                                      update({
                                        min_length:
                                          parseInt(e.target.value) || 0,
                                      })
                                    }
                                    min={0}
                                  />
                                </label>
                                <label className="optionbay-text-xs">
                                  {__("Max Length:", "optionbay")}{" "}
                                  <ClassicInput
                                    type="number"
                                    size="small"
                                    value={field.max_length || ""}
                                    onChange={(e) =>
                                      update({
                                        max_length:
                                          parseInt(e.target.value) || 0,
                                      })
                                    }
                                    min={0}
                                  />
                                </label>
                              </div>
                              <FormError
                                message={
                                  state.errors?.[`schema.${index}.min_length`]
                                }
                              />
                              <FormError
                                message={
                                  state.errors?.[`schema.${index}.max_length`]
                                }
                              />
                            </div>
                          ),
                        },
                      ]
                    : []),
                  ...(field.type === "number"
                    ? [
                        {
                          label: __("Restrictions", "optionbay"),
                          tooltip: FIELD_TOOLTIPS.restrictions,
                          render: () => (
                            <div className="optionbay-flex optionbay-flex-col optionbay-gap-1">
                              <div className="optionbay-flex optionbay-gap-2.5 optionbay-items-center optionbay-mb-2">
                                <label className="optionbay-text-xs">
                                  {__("Min:", "optionbay")}{" "}
                                  <ClassicInput
                                    type="number"
                                    size="small"
                                    value={field.min_value ?? ""}
                                    onChange={(e) =>
                                      update({
                                        min_value:
                                          parseFloat(e.target.value) || 0,
                                      })
                                    }
                                  />
                                </label>
                                <label className="optionbay-text-xs">
                                  {__("Max:", "optionbay")}{" "}
                                  <ClassicInput
                                    type="number"
                                    size="small"
                                    value={field.max_value ?? ""}
                                    onChange={(e) =>
                                      update({
                                        max_value:
                                          parseFloat(e.target.value) || 0,
                                      })
                                    }
                                  />
                                </label>
                              </div>
                              <label className="optionbay-text-xs">
                                {__("Step Value:", "optionbay")}{" "}
                                <ClassicInput
                                  type="number"
                                  size="small"
                                  value={field.step ?? ""}
                                  onChange={(e) =>
                                    update({
                                      step: parseFloat(e.target.value) || 1,
                                    })
                                  }
                                  step="0.01"
                                />
                              </label>
                              <FormError
                                message={
                                  state.errors?.[`schema.${index}.min_value`]
                                }
                              />
                              <FormError
                                message={
                                  state.errors?.[`schema.${index}.max_value`]
                                }
                              />
                              <FormError
                                message={state.errors?.[`schema.${index}.step`]}
                              />
                            </div>
                          ),
                        },
                      ]
                    : []),
                  ...(field.type === "file"
                    ? [
                        {
                          label: __("File Restrictions", "optionbay"),
                          tooltip: FIELD_TOOLTIPS.file_restrictions,
                          render: () => (
                            <div className="optionbay-flex optionbay-flex-col optionbay-gap-2">
                              <label className="optionbay-block">
                                <span className="optionbay-text-xs optionbay-block">
                                  {__(
                                    "Allowed Extensions (comma separated):",
                                    "optionbay",
                                  )}
                                </span>
                                <ClassicInput
                                  size="regular"
                                  value={field.allowed_types || ""}
                                  onChange={(e) =>
                                    update({ allowed_types: e.target.value })
                                  }
                                  placeholder=".jpg,.png,.pdf"
                                />
                                <FormError
                                  message={
                                    state.errors?.[
                                      `schema.${index}.allowed_types`
                                    ]
                                  }
                                />
                              </label>
                              <label className="optionbay-block">
                                <span className="optionbay-text-xs optionbay-block">
                                  {__("Max File Size (MB):", "optionbay")}
                                </span>
                                <ClassicInput
                                  type="number"
                                  size="small"
                                  value={field.max_file_size || ""}
                                  onChange={(e) =>
                                    update({
                                      max_file_size:
                                        parseInt(e.target.value) || 5,
                                    })
                                  }
                                  min={1}
                                />
                                <FormError
                                  message={
                                    state.errors?.[
                                      `schema.${index}.max_file_size`
                                    ]
                                  }
                                />
                              </label>
                            </div>
                          ),
                        },
                      ]
                    : []),
                  ...(hasOptions && field.options
                    ? [
                        {
                          label: __("Choices", "optionbay"),
                          tooltip: FIELD_TOOLTIPS.choices,
                          render: () => (
                            <OptionEditor
                              fieldId={field.id}
                              options={field.options!}
                              hideLabel
                            />
                          ),
                        },
                      ]
                    : []),
                  {
                    label: __("Conditional Logic", "optionbay"),
                    tooltip: FIELD_TOOLTIPS.conditional_logic,
                    render: () => (
                      <div className="">
                        <ConditionEditor
                          field={field}
                          index={index}
                          hideLabel
                        />
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};
