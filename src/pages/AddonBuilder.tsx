import { useEffect, useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { __ } from "@wordpress/i18n";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  ClassicButton,
  ClassicInput,
  ClassicSelect,
  ClassicCheckbox,
  ClassicMultiSelect,
} from "../components/classics";
import { ClassicSettingsTable } from "../components/classics/ClassicSettingsTable";
import { ClassicRepeater } from "../components/classics/ClassicRepeater";
import {
  AddonProvider,
  useAddonContext,
  getDefaultField,
  FieldDefinition,
  FieldOption,
} from "../store/AddonContext";
import apiFetch from "../utils/apiFetch";
import { MultiSelectOption } from "../components/common/MultiSelect";
import { addonGroupSchema } from "../utils/validation";

// ─── Product option rendering ────────────────────────────────────────────

/** Custom render for product options in ClassicMultiSelect (shows thumbnail, ID, SKU) */
function renderProductOption(option: MultiSelectOption) {
  const opt = option as any;
  return (
    <div className="optionbay-flex optionbay-items-center optionbay-gap-2">
      {opt.image && (
        <img
          src={opt.image}
          alt=""
          className="optionbay-w-8 optionbay-h-8 optionbay-object-cover optionbay-rounded optionbay-shrink-0"
        />
      )}
      <div className="optionbay-min-w-0">
        <div className="optionbay-font-medium optionbay-leading-tight">
          {opt.label}
        </div>
        <div className="optionbay-text-[11px] optionbay-text-[#888] optionbay-leading-tight">
          ID: {opt.value}
          {opt.sku ? ` • SKU: ${opt.sku}` : ""}
        </div>
      </div>
    </div>
  );
}

// ─── Field Types ─────────────────────────────────────────────────────────

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Textarea" },
  { value: "select", label: "Dropdown" },
  { value: "checkbox", label: "Checkbox" },
  { value: "radio", label: "Radio Buttons" },
  { value: "number", label: "Number" },
  { value: "file", label: "File Upload" },
];

const PRICE_TYPES = [
  { value: "none", label: "No Price" },
  { value: "flat", label: "Flat Fee" },
  { value: "percentage", label: "Percentage of Base" },
  { value: "character_count", label: "Per Character" },
  { value: "quantity_multiplier", label: "× Quantity" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────

const FormError = ({ message }: { message?: string }) => {
  if (!message) return null;
  return (
    <div className="optionbay-text-[#d63638] optionbay-text-xs optionbay-mt-1">
      {message}
    </div>
  );
};

// ─── Option Editor ───────────────────────────────────────────────────────

function OptionEditor({
  fieldId,
  options,
}: {
  fieldId: string;
  options: FieldOption[];
}) {
  const { state, dispatch } = useAddonContext();

  return (
    <div className="optionbay-flex optionbay-flex-col optionbay-gap-2.5 optionbay-mt-4">
      <label className="optionbay-font-semibold optionbay-block">
        {__("Choices", "optionbay")}
      </label>
      {options.map((opt, idx) => (
        <div
          key={idx}
          className="optionbay-flex optionbay-gap-2 optionbay-items-center"
        >
          <div className="optionbay-flex-1">
            <ClassicInput
              size="regular"
              placeholder={__("Label", "optionbay")}
              value={opt.label}
              onChange={(e) =>
                dispatch({
                  type: "UPDATE_OPTION",
                  payload: {
                    fieldId,
                    optionIndex: idx,
                    updates: {
                      label: e.target.value,
                      value: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                    },
                  },
                })
              }
            />
            <FormError
              message={
                state.errors?.[
                  `schema.${state.schema.findIndex(
                    (f) => f.id === fieldId,
                  )}.options.${idx}.label`
                ]
              }
            />
          </div>
          <ClassicInput
            type="number"
            size="small"
            placeholder={__("Price", "optionbay")}
            value={opt.price || ""}
            onChange={(e) =>
              dispatch({
                type: "UPDATE_OPTION",
                payload: {
                  fieldId,
                  optionIndex: idx,
                  updates: { price: parseFloat(e.target.value) || 0 },
                },
              })
            }
          />
          <ClassicSelect
            value={opt.price_type}
            onChange={(val) =>
              dispatch({
                type: "UPDATE_OPTION",
                payload: {
                  fieldId,
                  optionIndex: idx,
                  updates: { price_type: String(val) },
                },
              })
            }
            options={PRICE_TYPES.map((pt) => ({
              value: pt.value,
              label: pt.label,
            }))}
            size="short"
          />
          <button
            type="button"
            className="optionbay-text-[#b32d2e] hover:optionbay-text-[#d63638] optionbay-border-none optionbay-bg-transparent optionbay-cursor-pointer optionbay-text-[18px] optionbay-px-1"
            onClick={() =>
              dispatch({
                type: "REMOVE_OPTION",
                payload: { fieldId, optionIndex: idx },
              })
            }
            title={__("Remove choice", "optionbay")}
          >
            ×
          </button>
        </div>
      ))}
      <ClassicButton
        variant="secondary"
        onClick={() =>
          dispatch({
            type: "ADD_OPTION",
            payload: {
              fieldId,
              option: {
                label: "",
                value: "",
                price_type: "flat",
                price: 0,
                weight: 0,
              },
            },
          })
        }
      >
        + {__("Add Choice", "optionbay")}
      </ClassicButton>
      <FormError
        message={
          state.errors?.[
            `schema.${state.schema.findIndex((f) => f.id === fieldId)}.options`
          ]
        }
      />
    </div>
  );
}

// ─── Condition Editor ────────────────────────────────────────────────────

function ConditionEditor({
  field,
  index,
}: {
  field: FieldDefinition;
  index: number;
}) {
  const { state, dispatch } = useAddonContext();
  const siblingFields = state.schema.filter((f) => f.id !== field.id);
  const conditions = field.conditions;

  const updateConditions = (updates: Partial<typeof conditions>) => {
    dispatch({
      type: "UPDATE_FIELD",
      payload: {
        id: field.id,
        updates: { conditions: { ...conditions, ...updates } },
      },
    });
  };

  if (siblingFields.length === 0) {
    return (
      <p className="optionbay-text-[#666] optionbay-italic optionbay-mt-4">
        {__("Add more fields to set up conditional logic.", "optionbay")}
      </p>
    );
  }

  return (
    <div className="optionbay-mt-[15px] optionbay-p-[15px] optionbay-bg-[#f0f6fb] optionbay-border optionbay-border-[#c8d7e1] optionbay-rounded-md optionbay-flex optionbay-flex-col optionbay-gap-3">
      <div>
        <ClassicCheckbox
          label={__("Enable Conditional Logic", "optionbay")}
          checked={conditions.status === "active"}
          onChange={(checked) =>
            updateConditions({ status: checked ? "active" : "inactive" })
          }
        />
        <FormError
          message={state.errors?.[`schema.${index}.conditions.rules`]}
        />
      </div>

      {conditions.status === "active" && (
        <>
          <div className="optionbay-flex optionbay-gap-2 optionbay-items-center">
            <select
              value={conditions.action}
              onChange={(e) =>
                updateConditions({ action: e.target.value as "show" | "hide" })
              }
            >
              <option value="show">{__("Show", "optionbay")}</option>
              <option value="hide">{__("Hide", "optionbay")}</option>
            </select>
            <span>{__("this field if", "optionbay")}</span>
            <select
              value={conditions.match}
              onChange={(e) =>
                updateConditions({ match: e.target.value as "ALL" | "ANY" })
              }
            >
              <option value="ALL">{__("ALL", "optionbay")}</option>
              <option value="ANY">{__("ANY", "optionbay")}</option>
            </select>
            <span>{__("of these rules match:", "optionbay")}</span>
          </div>

          {(conditions.rules || []).map((rule, idx) => (
            <div
              key={idx}
              className="optionbay-flex optionbay-gap-2 optionbay-items-center"
            >
              <select
                value={rule.target_field_id}
                onChange={(e) => {
                  const rules = [...(conditions.rules || [])];
                  rules[idx] = {
                    ...rules[idx],
                    target_field_id: e.target.value,
                  };
                  updateConditions({ rules });
                }}
                className="optionbay-flex-1"
              >
                <option value="">{__("Select field...", "optionbay")}</option>
                {siblingFields.map((sf) => (
                  <option key={sf.id} value={sf.id}>
                    {sf.label || sf.id}
                  </option>
                ))}
              </select>
              <select
                value={rule.operator}
                onChange={(e) => {
                  const rules = [...(conditions.rules || [])];
                  rules[idx] = { ...rules[idx], operator: e.target.value };
                  updateConditions({ rules });
                }}
                className="optionbay-w-[120px]"
              >
                <option value="==">{__("equals", "optionbay")}</option>
                <option value="!=">{__("not equals", "optionbay")}</option>
                <option value=">">{__("greater than", "optionbay")}</option>
                <option value="<">{__("less than", "optionbay")}</option>
                <option value="contains">{__("contains", "optionbay")}</option>
                <option value="empty">{__("is empty", "optionbay")}</option>
                <option value="not_empty">
                  {__("is not empty", "optionbay")}
                </option>
              </select>
              {!["empty", "not_empty"].includes(rule.operator) && (
                <ClassicInput
                  size="regular"
                  value={rule.value}
                  onChange={(e) => {
                    const rules = [...(conditions.rules || [])];
                    rules[idx] = { ...rules[idx], value: e.target.value };
                    updateConditions({ rules });
                  }}
                  placeholder={__("Value", "optionbay")}
                  className="optionbay-flex-1"
                />
              )}
              <button
                type="button"
                className="optionbay-text-[#b32d2e] hover:optionbay-text-[#d63638] optionbay-border-none optionbay-bg-transparent optionbay-cursor-pointer optionbay-text-[18px] optionbay-px-1"
                onClick={() => {
                  const rules = (conditions.rules || []).filter(
                    (_, i) => i !== idx,
                  );
                  updateConditions({ rules });
                }}
              >
                ×
              </button>
            </div>
          ))}

          <ClassicButton
            variant="secondary"
            onClick={() => {
              const rules = [
                ...(conditions.rules || []),
                { target_field_id: "", operator: "==", value: "" },
              ];
              updateConditions({ rules });
            }}
          >
            + {__("Add Rule", "optionbay")}
          </ClassicButton>
        </>
      )}
    </div>
  );
}

// ─── Field Row ───────────────────────────────────────────────────────────

function FieldRow({ field, index }: { field: FieldDefinition; index: number }) {
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
            className={`optionbay-flex optionbay-justify-between optionbay-items-center optionbay-px-[15px] optionbay-py-[10px] optionbay-bg-[#f8f9fa] optionbay-border-b optionbay-border-[#e5e7eb] optionbay-rounded-t-[8px] optionbay-cursor-default ${
              isMinimized ? "optionbay-rounded-[8px]" : ""
            }`}
          >
            <div className="optionbay-flex optionbay-items-center">
              <span
                {...provided.dragHandleProps}
                className="optionbay-cursor-grab active:optionbay-cursor-grabbing optionbay-text-[#9ca3af] optionbay-mr-[10px] optionbay-text-[18px] optionbay-flex optionbay-items-center"
                title={__("Drag to reorder", "optionbay")}
              >
                ☰
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
            <div className="optionbay-flex optionbay-gap-2 optionbay-items-center">
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="optionbay-bg-transparent optionbay-border-none optionbay-cursor-pointer optionbay-p-1 optionbay-flex optionbay-items-center optionbay-text-[#646970]"
                title={
                  isMinimized
                    ? __("Expand", "optionbay")
                    : __("Minimize", "optionbay")
                }
              >
                {isMinimized ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronUp size={16} />
                )}
              </button>
              <ClassicButton
                variant="link-delete"
                onClick={() =>
                  dispatch({ type: "REMOVE_FIELD", payload: field.id })
                }
                className="!optionbay-text-xs !optionbay-no-underline !optionbay-m-0"
              >
                {__("Remove", "optionbay")}
              </ClassicButton>
            </div>
          </div>

          {/* Body */}
          {!isMinimized && (
            <div className="optionbay-p-[20px]">
              <table className="form-table !optionbay-m-0 [&_th]:!optionbay-w-[150px] [&_th]:!optionbay-p-[10px_10px_10px_0] [&_th]:!optionbay-font-medium [&_th]:!optionbay-text-[#50575e] [&_td]:!optionbay-py-[10px] [&_td]:!optionbay-px-0">
                <tbody>
                  {/* Type */}
                  <tr>
                    <th scope="row">{__("Field Type", "optionbay")}</th>
                    <td>
                      <ClassicSelect
                        value={field.type}
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
                    </td>
                  </tr>

                  {/* Label */}
                  <tr>
                    <th scope="row">{__("Label", "optionbay")}</th>
                    <td>
                      <ClassicInput
                        size="regular"
                        value={field.label}
                        onChange={(e) => update({ label: e.target.value })}
                        placeholder={__("Enter field label", "optionbay")}
                      />
                      <FormError
                        message={state.errors?.[`schema.${index}.label`]}
                      />
                    </td>
                  </tr>

                  {/* Description */}
                  <tr>
                    <th scope="row">{__("Description", "optionbay")}</th>
                    <td>
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
                    </td>
                  </tr>

                  {/* Required */}
                  <tr>
                    <th scope="row">{__("Validation", "optionbay")}</th>
                    <td>
                      <ClassicCheckbox
                        label={__("Required Field", "optionbay")}
                        checked={field.required}
                        onChange={(checked) => update({ required: checked })}
                      />
                    </td>
                  </tr>

                  {/* Placeholder (text/textarea/number) */}
                  {["text", "textarea", "number"].includes(field.type) && (
                    <tr>
                      <th scope="row">{__("Placeholder", "optionbay")}</th>
                      <td>
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
                      </td>
                    </tr>
                  )}

                  {/* Pricing (for field-level pricing on non-option fields) */}
                  {!hasOptions && (
                    <>
                      <tr>
                        <th scope="row">{__("Pricing Logic", "optionbay")}</th>
                        <td>
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
                        </td>
                      </tr>
                      {field.price_type !== "none" && (
                        <tr>
                          <th scope="row">{__("Price Amount", "optionbay")}</th>
                          <td>
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
                          </td>
                        </tr>
                      )}
                    </>
                  )}

                  {/* Min/Max for text */}
                  {["text", "textarea"].includes(field.type) && (
                    <tr>
                      <th scope="row">{__("Restrictions", "optionbay")}</th>
                      <td className="optionbay-flex optionbay-gap-2.5 optionbay-items-center">
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
                      </td>
                    </tr>
                  )}

                  {/* Min/Max/Step for number */}
                  {field.type === "number" && (
                    <tr>
                      <th scope="row">{__("Restrictions", "optionbay")}</th>
                      <td>
                        <div className="optionbay-flex optionbay-gap-2.5 optionbay-items-center optionbay-mb-2">
                          <label className="optionbay-text-xs">
                            {__("Min:", "optionbay")}{" "}
                            <ClassicInput
                              type="number"
                              size="small"
                              value={field.min_value ?? ""}
                              onChange={(e) =>
                                update({
                                  min_value: parseFloat(e.target.value) || 0,
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
                                  max_value: parseFloat(e.target.value) || 0,
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
                              update({ step: parseFloat(e.target.value) || 1 })
                            }
                            step="0.01"
                          />
                        </label>
                      </td>
                    </tr>
                  )}

                  {/* File settings */}
                  {field.type === "file" && (
                    <>
                      <tr>
                        <th scope="row">
                          {__("File Restrictions", "optionbay")}
                        </th>
                        <td>
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
                                  max_file_size: parseInt(e.target.value) || 5,
                                })
                              }
                              min={1}
                            />
                          </label>
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>

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
}

// ─── Main Builder (inner) ────────────────────────────────────────────────

function BuilderInner() {
  const { state, dispatch } = useAddonContext();
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const isEdit = !!params.id;

  const [activeAssignmentType, setActiveAssignmentType] = useState<
    "product" | "category" | "tag"
  >("product");

  // Load existing group
  useEffect(() => {
    if (!isEdit) return;

    const loadGroup = async () => {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const data = (await apiFetch({
          path: `optionbay/v1/groups/${params.id}`,
          method: "GET",
        })) as any;

        dispatch({
          type: "SET_GROUP",
          payload: {
            id: data.id,
            title: data.title,
            status: data.status,
            schema: data.schema || [],
            settings: data.settings || {
              layout: "flat",
              priority: 10,
              active: true,
            },
            assignments: (data.assignments || []).map((a: any) => ({
              ...a,
              target_id: parseInt(a.target_id) || 0,
              is_exclusion: !!parseInt(a.is_exclusion),
              priority: parseInt(a.priority) || 10,
            })),
          },
        });
      } catch (err) {
        dispatch({
          type: "SET_ERROR",
          payload: __("Failed to load option group.", "optionbay"),
        });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    loadGroup();
  }, [isEdit, params.id, dispatch]);

  // Sync initial assignment type when loading an existing group
  useEffect(() => {
    const nonGlobal = state.assignments.filter(
      (a) => a.target_type !== "global",
    );
    if (nonGlobal.length > 0) {
      setActiveAssignmentType(
        nonGlobal[0].target_type as "product" | "category" | "tag",
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.settings?.priority]); // Just need to trigger once on load, priority is decent proxy since it's in the payload

  // Save handler
  const handleSave = useCallback(async () => {
    dispatch({ type: "SET_SAVING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });
    dispatch({ type: "SET_ERRORS", payload: {} });

    try {
      const payload = {
        title: state.title,
        status: state.status,
        schema: state.schema,
        settings: state.settings,
        assignments: state.assignments,
      };

      const result = addonGroupSchema.safeParse(payload);
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.issues.forEach((issue) => {
          const path = issue.path.join(".");
          fieldErrors[path] = issue.message;
        });
        dispatch({ type: "SET_ERRORS", payload: fieldErrors });
        dispatch({
          type: "SET_ERROR",
          payload: __("Please fix the validation errors below.", "optionbay"),
        });
        dispatch({ type: "SET_SAVING", payload: false });
        return;
      }

      if (isEdit && state.id) {
        await apiFetch({
          path: `optionbay/v1/groups/${state.id}`,
          method: "PUT",
          data: payload,
        });
        dispatch({ type: "MARK_CLEAN" });
      } else {
        const response = (await apiFetch({
          path: "optionbay/v1/groups",
          method: "POST",
          data: payload,
        })) as any;

        if (response.id) {
          navigate(`/option-groups/${response.id}`, { replace: true });
        }
      }
    } catch (err: any) {
      dispatch({
        type: "SET_ERROR",
        payload:
          err?.message || __("Failed to save option group.", "optionbay"),
      });
    } finally {
      dispatch({ type: "SET_SAVING", payload: false });
    }
  }, [state, isEdit, dispatch, navigate]);

  // Drag-and-drop
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(state.schema);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    dispatch({ type: "REORDER_FIELDS", payload: items });
  };

  // Add field
  const addField = (type: string) => {
    const field = getDefaultField(type);
    dispatch({ type: "ADD_FIELD", payload: field });
  };

  if (state.isLoading) {
    return (
      <div className="optionbay-text-center optionbay-py-[100px]">
        <p className="optionbay-loader-container">
          <span className="spinner is-active optionbay-float-none"></span>
          <br />
          {__("Loading option group...", "optionbay")}
        </p>
      </div>
    );
  }

  return (
    <div className="optionbay-ignore-preflight">
      {/* Error notice */}
      {state.error && (
        <div className="notice notice-error is-dismissible optionbay-mb-5">
          <p>{state.error}</p>
        </div>
      )}

      {/* Top bar */}
      <div className="optionbay-flex optionbay-flex-col sm:optionbay-flex-row optionbay-justify-between optionbay-items-start sm:optionbay-items-center optionbay-gap-4 optionbay-mb-6 optionbay-bg-white optionbay-p-[15px_20px] optionbay-rounded-lg optionbay-shadow-sm">
        <ClassicButton
          variant="secondary"
          onClick={() => navigate("/option-groups")}
        >
          ← {__("Back to List", "optionbay")}
        </ClassicButton>
        <div className="optionbay-flex optionbay-flex-wrap optionbay-items-center optionbay-gap-4">
          <div className="optionbay-flex optionbay-items-center optionbay-gap-2">
            <span className="optionbay-text-[13px] optionbay-text-[#646970] optionbay-mr-1">
              {__("Status:", "optionbay")}
            </span>
            <button
              type="button"
              onClick={() =>
                dispatch({
                  type: "SET_STATUS",
                  payload: state.status === "publish" ? "draft" : "publish",
                })
              }
              className={`optionbay-relative optionbay-inline-flex optionbay-h-5 optionbay-w-10 optionbay-items-center optionbay-rounded-full optionbay-transition-colors focus:optionbay-outline-none ${
                state.status === "publish"
                  ? "optionbay-bg-blue-600"
                  : "optionbay-bg-gray-400"
              }`}
              title={
                state.status === "publish"
                  ? __("Active", "optionbay")
                  : __("Draft", "optionbay")
              }
            >
              <span
                className={`optionbay-inline-block optionbay-h-3.5 optionbay-w-3.5 optionbay-transform optionbay-rounded-full optionbay-bg-white optionbay-transition-transform ${
                  state.status === "publish"
                    ? "optionbay-translate-x-5"
                    : "optionbay-translate-x-1"
                }`}
              />
            </button>
            <span
              className={`optionbay-text-[13px] optionbay-min-w-[45px] ${
                state.status === "publish"
                  ? "optionbay-text-[#1d2327]"
                  : "optionbay-text-[#646970]"
              }`}
            >
              {state.status === "publish"
                ? __("Active", "optionbay")
                : __("Draft", "optionbay")}
            </span>
          </div>
          <ClassicButton
            variant="primary"
            onClick={handleSave}
            disabled={state.isSaving}
          >
            {state.isSaving
              ? __("Saving...", "optionbay")
              : isEdit
              ? __("Update Group", "optionbay")
              : __("Create Group", "optionbay")}
          </ClassicButton>
        </div>
      </div>

      {/* Main content: 2-column layout */}
      <div className="optionbay-flex optionbay-flex-col lg:optionbay-flex-row optionbay-gap-6 optionbay-items-start">
        {/* Left: Title + Fields */}
        <div className="optionbay-w-full optionbay-flex optionbay-flex-col optionbay-gap-6">
          {/* Group Title */}
          <div>
            {/* <div className="postbox"> */}
            <div className="inside !optionbay-p-0">
              <ClassicInput
                className="optionbay-w-full !optionbay-text-[20px] !optionbay-font-semibold !optionbay-py-3 !optionbay-px-4 !optionbay-border !optionbay-border-[#ddd] !optionbay-rounded-md focus:!optionbay-border-[#2271b1] focus:!optionbay-shadow-[0_0_0_1px_#2271b1] focus:!optionbay-outline-none"
                size="large"
                value={state.title}
                onChange={(e) =>
                  dispatch({ type: "SET_TITLE", payload: e.target.value })
                }
                placeholder={__("Enter Option Group Title", "optionbay")}
              />
              <FormError message={state.errors?.title} />
            </div>
            {/* </div> */}
          </div>

          {/* Assignment Rules */}
          <ClassicSettingsTable
            title={__("Assignment Rules", "optionbay")}
            description={__(
              "Choose where this option group should be displayed.",
              "optionbay",
            )}
            fields={[
              {
                label: __("Global Assignment", "optionbay"),
                tooltip: __(
                  "If enabled, these options will appear on every product in your store.",
                  "optionbay",
                ),
                render: () => (
                  <ClassicCheckbox
                    label={__("Enable for all products", "optionbay")}
                    checked={state.assignments.some(
                      (a) => a.target_type === "global",
                    )}
                    onChange={(checked) => {
                      if (checked) {
                        dispatch({
                          type: "SET_ASSIGNMENTS",
                          payload: [
                            {
                              target_type: "global",
                              target_id: 0,
                              is_exclusion: false,
                              priority: state.settings.priority,
                            },
                          ],
                        });
                      } else {
                        dispatch({
                          type: "SET_ASSIGNMENTS",
                          payload: state.assignments.filter(
                            (a) => a.target_type !== "global",
                          ),
                        });
                      }
                    }}
                  />
                ),
              },
              ...(!state.assignments.some((a) => a.target_type === "global")
                ? [
                    {
                      label: __("Assign By", "optionbay"),
                      render: () => (
                        <div className="optionbay-max-w-[300px]">
                          <ClassicSelect
                            value={activeAssignmentType}
                            differentDropdownWidth
                            onChange={(val) => {
                              setActiveAssignmentType(val as any);
                              dispatch({ type: "SET_ASSIGNMENTS", payload: [] });
                            }}
                            options={[
                              {
                                value: "product",
                                label: __("Products", "optionbay"),
                              },
                              {
                                value: "category",
                                label: __("Categories", "optionbay"),
                              },
                              { value: "tag", label: __("Tags", "optionbay") },
                            ]}
                          />
                        </div>
                      ),
                    },
                    {
                      label:
                        activeAssignmentType === "product"
                          ? __("Select Products", "optionbay")
                          : activeAssignmentType === "category"
                          ? __("Select Categories", "optionbay")
                          : __("Select Tags", "optionbay"),
                      render: () => (
                        <div className="optionbay-max-w-[600px]">
                          {activeAssignmentType === "product" && (
                            <ClassicMultiSelect
                              value={state.assignments
                                .filter((a) => a.target_type === "product")
                                .map((a) => a.target_id)}
                              onChange={(ids) => {
                                const prodAssignments = (ids as number[]).map(
                                  (id) => ({
                                    target_type: "product" as const,
                                    target_id: id,
                                    is_exclusion: false,
                                    priority: state.settings.priority,
                                  }),
                                );
                                dispatch({
                                  type: "SET_ASSIGNMENTS",
                                  payload: prodAssignments,
                                });
                              }}
                              endpoint="/optionbay/v1/resources/products"
                              placeholder={__(
                                "Search products...",
                                "optionbay",
                              )}
                              renderOption={renderProductOption}
                              size="regular"
                            />
                          )}
                          {activeAssignmentType === "category" && (
                            <ClassicMultiSelect
                              value={state.assignments
                                .filter((a) => a.target_type === "category")
                                .map((a) => a.target_id)}
                              onChange={(ids) => {
                                const catAssignments = (ids as number[]).map(
                                  (id) => ({
                                    target_type: "category" as const,
                                    target_id: id,
                                    is_exclusion: false,
                                    priority: state.settings.priority,
                                  }),
                                );
                                dispatch({
                                  type: "SET_ASSIGNMENTS",
                                  payload: catAssignments,
                                });
                              }}
                              endpoint="/optionbay/v1/resources/categories"
                              placeholder={__(
                                "Search categories...",
                                "optionbay",
                              )}
                              size="regular"
                            />
                          )}
                          {activeAssignmentType === "tag" && (
                            <ClassicMultiSelect
                              value={state.assignments
                                .filter((a) => a.target_type === "tag")
                                .map((a) => a.target_id)}
                              onChange={(ids) => {
                                const tagAssignments = (ids as number[]).map(
                                  (id) => ({
                                    target_type: "tag" as const,
                                    target_id: id,
                                    is_exclusion: false,
                                    priority: state.settings.priority,
                                  }),
                                );
                                dispatch({
                                  type: "SET_ASSIGNMENTS",
                                  payload: tagAssignments,
                                });
                              }}
                              endpoint="/optionbay/v1/resources/tags"
                              placeholder={__("Search tags...", "optionbay")}
                              size="regular"
                            />
                          )}
                        </div>
                      ),
                    },
                  ]
                : []),
            ]}
          />

          {/* Fields list with drag-and-drop */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="fields-list">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="optionbay-flex optionbay-flex-col optionbay-gap-4 optionbay-min-h-[100px]"
                >
                  {state.schema.length === 0 ? (
                    <div className="postbox optionbay-text-center optionbay-px-5 optionbay-py-[60px] optionbay-text-[#999] optionbay-border-dashed optionbay-border-[#c3c4c7] optionbay-rounded-lg">
                      <p className="optionbay-text-base optionbay-mb-2">
                        {__("Your group is empty", "optionbay")}
                      </p>
                      <p className="optionbay-text-[13px]">
                        {__(
                          "Click the field buttons in the sidebar to start building.",
                          "optionbay",
                        )}
                      </p>
                    </div>
                  ) : (
                    state.schema.map((field, index) => (
                      <FieldRow key={field.id} field={field} index={index} />
                    ))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* Right: Sidebar */}
        <div className="optionbay-w-full lg:optionbay-w-[320px] optionbay-flex optionbay-flex-col optionbay-gap-5">
          {/* Add Field Section */}
          <div className="optionbay-bg-white optionbay-border optionbay-border-[#c3c4c7] optionbay-rounded-[8px]">
            <div className="optionbay-px-[15px] optionbay-py-[12px] optionbay-bg-[#f8f9fa] optionbay-border-b optionbay-border-[#e5e7eb] optionbay-font-semibold optionbay-text-[14px] optionbay-rounded-t-[8px]">
              {__("Add Fields", "optionbay")}
            </div>
            <div className="optionbay-p-[15px]">
              <div className="optionbay-grid optionbay-grid-cols-2 optionbay-gap-2">
                {FIELD_TYPES.map((ft) => (
                  <ClassicButton
                    key={ft.value}
                    variant="secondary"
                    onClick={() => addField(ft.value)}
                    className="!optionbay-justify-center !optionbay-text-center !optionbay-px-1 !optionbay-py-1.5 !optionbay-h-auto !optionbay-text-xs"
                  >
                    + {ft.label}
                  </ClassicButton>
                ))}
              </div>
            </div>
          </div>

          {/* Group Settings Section */}
          <div className="optionbay-bg-white optionbay-border optionbay-border-[#c3c4c7] optionbay-rounded-[8px] optionbay-mt-4">
            <div className="optionbay-px-[15px] optionbay-py-[12px] optionbay-bg-[#f8f9fa] optionbay-border-b optionbay-border-[#e5e7eb] optionbay-font-semibold optionbay-text-[14px] optionbay-rounded-t-[8px]">
              {__("Group Settings", "optionbay")}
            </div>
            <div className="optionbay-p-[15px]">
              <div className="optionbay-mb-4">
                <label className="optionbay-block optionbay-mb-1 optionbay-font-semibold">
                  {__("Display Layout", "optionbay")}
                </label>
                <ClassicSelect
                  value={state.settings.layout}
                  onChange={(val) =>
                    dispatch({
                      type: "SET_SETTINGS",
                      payload: { layout: String(val) as "flat" | "accordion" },
                    })
                  }
                  options={[
                    {
                      value: "flat",
                      label: __("Flat (Standard)", "optionbay"),
                    },
                    { value: "accordion", label: __("Accordion", "optionbay") },
                  ]}
                  size="regular"
                />
              </div>
              <div className="optionbay-mb-1">
                <label className="optionbay-block optionbay-mb-1 optionbay-font-semibold">
                  {__("Priority Order", "optionbay")}
                </label>
                <ClassicInput
                  type="number"
                  size="small"
                  value={state.settings.priority}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_SETTINGS",
                      payload: { priority: parseInt(e.target.value) || 10 },
                    })
                  }
                  className="optionbay-w-full"
                />
              </div>
              <p className="description optionbay-mt-1 optionbay-mb-0">
                {__("Determines display order on product page.", "optionbay")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Exported Component (wraps with AddonProvider) ───────────────────────

export default function AddonBuilder() {
  return (
    <AddonProvider>
      <BuilderInner />
    </AddonProvider>
  );
}
