import React, { useState } from "react";
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
import { FormError } from "./FormError";
import { OptionEditor } from "./OptionEditor";
import { ConditionEditor } from "./ConditionEditor";

interface FieldRowProps {
  field: FieldDefinition;
  index: number;
}

export const FieldRow: React.FC<FieldRowProps> = ({ field, index }) => {
  const { state, dispatch } = useAddonContext();
  const [isMinimized, setIsMinimized] = useState(false);
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
          className={`ob-field-card ${
            snapshot.isDragging ? "is-dragging" : ""
          }`}
          style={{ ...provided.draggableProps.style }}
        >
          {/* Header */}
          <div
            className={`optionbay-flex optionbay-justify-between optionbay-items-center optionbay-py-[10px] optionbay-cursor-default`}
          >
            <div className="optionbay-flex optionbay-items-center">
              <span
                {...provided.dragHandleProps}
                className="optionbay-cursor-grab active:optionbay-cursor-grabbing optionbay-text-[#9ca3af] optionbay-mr-[10px] optionbay-text-[18px] optionbay-flex optionbay-items-center"
                title={__("Drag to reorder", "optionbay")}
              >
                <Menu />
              </span>
              <span className="optionbay-font-semibold optionbay-text-[14px] optionbay-text-[#1d2327]">
                {field.label || __("Untitled Field", "optionbay")}
              </span>
              <span className="optionbay-text-[11px] optionbay-uppercase optionbay-bg-[#e5e7eb] optionbay-text-[#4b5563] optionbay-px-1.5 optionbay-py-0.5 optionbay-rounded optionbay-ml-2 optionbay-font-medium">
                {field.type}
              </span>
              {field.required && (
                <span
                  className="optionbay-text-[#c00] optionbay-ml-1 optionbay-font-bold"
                  title={__("Required field", "optionbay")}
                >
                  *
                </span>
              )}
            </div>
            <div className="optionbay-flex optionbay-gap-1 optionbay-items-center">
              {/* Move Up */}
              <Tooltip
                content={__("Move up", "optionbay")}
                disabled={index === 0}
              >
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => dispatch({ type: "MOVE_UP", payload: index })}
                  className={`optionbay-bg-transparent optionbay-border-none optionbay-cursor-pointer optionbay-p-1.5 optionbay-flex optionbay-items-center optionbay-transition-colors ${
                    index === 0
                      ? "optionbay-text-[#ccd0d4] optionbay-cursor-not-allowed"
                      : "optionbay-text-[#646970] hover:optionbay-text-[#2271b1]"
                  }`}
                  title={__("Move up", "optionbay")}
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
                  onClick={() =>
                    dispatch({ type: "MOVE_DOWN", payload: index })
                  }
                  className={`optionbay-bg-transparent optionbay-border-none optionbay-cursor-pointer optionbay-p-1.5 optionbay-flex optionbay-items-center optionbay-transition-colors ${
                    index === state.schema.length - 1
                      ? "optionbay-text-[#ccd0d4] optionbay-cursor-not-allowed"
                      : "optionbay-text-[#646970] hover:optionbay-text-[#2271b1]"
                  }`}
                  title={__("Move down", "optionbay")}
                >
                  <ChevronDown size={16} />
                </button>
              </Tooltip>
              {/* Minimize Toggle */}
              <Tooltip
                content={
                  isMinimized
                    ? __("Expand", "optionbay")
                    : __("Minimize", "optionbay")
                }
              >
                <button
                  type="button"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="optionbay-bg-transparent optionbay-border-none optionbay-cursor-pointer optionbay-p-1.5 optionbay-flex optionbay-items-center optionbay-text-[#646970] hover:optionbay-text-[#2271b1] optionbay-transition-colors"
                  title={
                    isMinimized
                      ? __("Expand", "optionbay")
                      : __("Minimize", "optionbay")
                  }
                >
                  {isMinimized ? (
                    <ChevronsUpDown className="optionbay-rotate-45" size={18} />
                  ) : (
                    <Minus size={18} />
                  )}
                </button>
              </Tooltip>
              {/* Delete Field */}
              <Tooltip content={__("Delete field", "optionbay")}>
                <button
                  type="button"
                  onClick={() => {
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
                  className="optionbay-bg-transparent optionbay-border-none optionbay-cursor-pointer optionbay-p-1.5 optionbay-flex optionbay-items-center optionbay-text-[#d63638] hover:optionbay-text-[#b32d2e] optionbay-ml-1 optionbay-transition-colors"
                  title={__("Remove field", "optionbay")}
                >
                  <Trash2 size={16} />
                </button>
              </Tooltip>
            </div>
          </div>

          {/* Body */}
          {!isMinimized && (
            <div className="optionbay-pl-4">
              <ClassicSettingsTable
                className=""
                fields={[
                  {
                    label: __("Field Type", "optionbay"),
                    render: () => (
                      <ClassicSelect
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
                    render: () => (
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
                    ),
                  },
                  {
                    label: __("Validation", "optionbay"),
                    render: () => (
                      <ClassicCheckbox
                        label={__("Required Field", "optionbay")}
                        checked={field.required}
                        onChange={(checked) => update({ required: checked })}
                      />
                    ),
                  },
                  ...(["text", "textarea", "number"].includes(field.type)
                    ? [
                        {
                          label: __("Placeholder", "optionbay"),
                          render: () => (
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
                          ),
                        },
                      ]
                    : []),
                  ...(!hasOptions
                    ? [
                        {
                          label: __("Pricing Logic", "optionbay"),
                          render: () => (
                            <ClassicSelect
                              value={field.price_type}
                              onChange={(val) =>
                                update({ price_type: String(val) })
                              }
                              options={PRICE_TYPES.map((pt) => ({
                                value: pt.value,
                                label: pt.label,
                              }))}
                            />
                          ),
                        },
                        ...(field.price_type !== "none"
                          ? [
                              {
                                label: __("Price Amount", "optionbay"),
                                render: () => (
                                  <ClassicInput
                                    type="number"
                                    size="small"
                                    value={field.price || ""}
                                    onChange={(e) =>
                                      update({
                                        price: parseFloat(e.target.value) || 0,
                                      })
                                    }
                                    step="0.01"
                                    placeholder="0.00"
                                  />
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
                          render: () => (
                            <div className="optionbay-flex optionbay-gap-2.5 optionbay-items-center">
                              <label className="optionbay-text-xs">
                                {__("Min Length:", "optionbay")}{" "}
                                <ClassicInput
                                  type="number"
                                  size="small"
                                  value={field.min_length || ""}
                                  onChange={(e) =>
                                    update({
                                      min_length: parseInt(e.target.value) || 0,
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
                                      max_length: parseInt(e.target.value) || 0,
                                    })
                                  }
                                  min={0}
                                />
                              </label>
                            </div>
                          ),
                        },
                      ]
                    : []),
                  ...(field.type === "number"
                    ? [
                        {
                          label: __("Restrictions", "optionbay"),
                          render: () => (
                            <>
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
                            </>
                          ),
                        },
                      ]
                    : []),
                  ...(field.type === "file"
                    ? [
                        {
                          label: __("File Restrictions", "optionbay"),
                          render: () => (
                            <>
                              <label className="optionbay-block optionbay-mb-2">
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
                              </label>
                            </>
                          ),
                        },
                      ]
                    : []),
                ]}
              />

              {/* Options editor for select/radio/checkbox */}
              {hasOptions && field.options && (
                <OptionEditor fieldId={field.id} options={field.options} />
              )}

              {/* Conditional Logic */}
              <ConditionEditor field={field} index={index} />
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};
