import { useEffect, useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { __ } from "@wordpress/i18n";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { ClassicButton, ClassicInput, ClassicSelect, ClassicCheckbox, ClassicMultiSelect } from "../components/classics";
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

// ─── Product option rendering ────────────────────────────────────────────

/** Custom render for product options in ClassicMultiSelect (shows thumbnail, ID, SKU) */
function renderProductOption(option: MultiSelectOption) {
  const opt = option as any;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      {opt.image && (
        <img
          src={opt.image}
          alt=""
          style={{ width: 32, height: 32, objectFit: "cover", borderRadius: "4px", flexShrink: 0 }}
        />
      )}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 500, lineHeight: "1.3" }}>{opt.label}</div>
        <div style={{ fontSize: "11px", color: "#888", lineHeight: "1.3" }}>
          ID: {opt.value}{opt.sku ? ` • SKU: ${opt.sku}` : ""}
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

// ─── Option Editor ───────────────────────────────────────────────────────

function OptionEditor({
  fieldId,
  options,
}: {
  fieldId: string;
  options: FieldOption[];
}) {
  const { dispatch } = useAddonContext();

  return (
    <div className="ob-option-editor" style={{ marginTop: "15px" }}>
      <label style={{ fontWeight: 600, display: "block", marginBottom: "10px" }}>
        {__("Choices", "optionbay")}
      </label>
      {options.map((opt, idx) => (
        <div key={idx} className="ob-option-row">
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
            options={PRICE_TYPES.map((pt) => ({ value: pt.value, label: pt.label }))}
            size="short"
          />
          <button
            type="button"
            className="ob-remove-option"
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
              option: { label: "", value: "", price_type: "flat", price: 0, weight: 0 },
            },
          })
        }
      >
        + {__("Add Choice", "optionbay")}
      </ClassicButton>
    </div>
  );
}

// ─── Condition Editor ────────────────────────────────────────────────────

function ConditionEditor({ field }: { field: FieldDefinition }) {
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
      <p style={{ color: "#666", fontStyle: "italic", marginTop: "15px" }}>
        {__("Add more fields to set up conditional logic.", "optionbay")}
      </p>
    );
  }

  return (
    <div className="ob-condition-builder">
      <div style={{ marginBottom: "15px" }}>
        <ClassicCheckbox
          label={__("Enable Conditional Logic", "optionbay")}
          checked={conditions.status === "active"}
          onChange={(checked) =>
            updateConditions({ status: checked ? "active" : "inactive" })
          }
        />
      </div>

      {conditions.status === "active" && (
        <>
          <div className="ob-condition-row" style={{ marginBottom: "15px" }}>
            <select
              value={conditions.action}
              onChange={(e) => updateConditions({ action: e.target.value as "show" | "hide" })}
            >
              <option value="show">{__("Show", "optionbay")}</option>
              <option value="hide">{__("Hide", "optionbay")}</option>
            </select>
            <span>{__("this field if", "optionbay")}</span>
            <select
              value={conditions.match}
              onChange={(e) => updateConditions({ match: e.target.value as "ALL" | "ANY" })}
            >
              <option value="ALL">{__("ALL", "optionbay")}</option>
              <option value="ANY">{__("ANY", "optionbay")}</option>
            </select>
            <span>{__("of these rules match:", "optionbay")}</span>
          </div>

          {(conditions.rules || []).map((rule, idx) => (
            <div key={idx} className="ob-condition-row">
              <select
                value={rule.target_field_id}
                onChange={(e) => {
                  const rules = [...(conditions.rules || [])];
                  rules[idx] = { ...rules[idx], target_field_id: e.target.value };
                  updateConditions({ rules });
                }}
                style={{ flex: 1 }}
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
                style={{ width: "120px" }}
              >
                <option value="==">{__("equals", "optionbay")}</option>
                <option value="!=">{__("not equals", "optionbay")}</option>
                <option value=">">{__("greater than", "optionbay")}</option>
                <option value="<">{__("less than", "optionbay")}</option>
                <option value="contains">{__("contains", "optionbay")}</option>
                <option value="empty">{__("is empty", "optionbay")}</option>
                <option value="not_empty">{__("is not empty", "optionbay")}</option>
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
                  style={{ flex: 1 }}
                />
              )}
              <button
                type="button"
                className="ob-remove-option"
                onClick={() => {
                  const rules = (conditions.rules || []).filter((_, i) => i !== idx);
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
  const { dispatch } = useAddonContext();
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
          className={`ob-field-card ${snapshot.isDragging ? "is-dragging" : ""}`}
          style={{ ...provided.draggableProps.style }}
        >
          {/* Header */}
          <div className="ob-field-card-header">
            <div style={{ display: "flex", alignItems: "center" }}>
              <span
                {...provided.dragHandleProps}
                className="ob-drag-handle"
                title={__("Drag to reorder", "optionbay")}
              >
                ☰
              </span>
              <span className="ob-field-label-text">
                {field.label || __("Untitled Field", "optionbay")}
              </span>
              <span className="ob-field-type-badge">{field.type}</span>
              {field.required && (
                <span
                  style={{ color: "#c00", marginLeft: "4px", fontWeight: "bold" }}
                  title={__("Required field", "optionbay")}
                >
                  *
                </span>
              )}
            </div>
            <ClassicButton
              variant="link-delete"
              onClick={() => dispatch({ type: "REMOVE_FIELD", payload: field.id })}
              style={{ fontSize: "12px", textDecoration: "none" }}
            >
              {__("Remove", "optionbay")}
            </ClassicButton>
          </div>

          {/* Body */}
          <div className="ob-field-card-body">
            <table className="form-table">
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
                      options={FIELD_TYPES.map((ft) => ({ value: ft.value, label: ft.label }))}
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
                  </td>
                </tr>

                {/* Description */}
                <tr>
                  <th scope="row">{__("Description", "optionbay")}</th>
                  <td>
                    <textarea
                      className="large-text"
                      rows={2}
                      value={field.description}
                      onChange={(e) => update({ description: e.target.value })}
                      placeholder={__("Help text shown below the field", "optionbay")}
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
                        onChange={(e) => update({ placeholder: e.target.value })}
                        placeholder={__("Optional placeholder text", "optionbay")}
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
                          onChange={(val) => update({ price_type: String(val) })}
                          options={PRICE_TYPES.map((pt) => ({ value: pt.value, label: pt.label }))}
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
                              update({ price: parseFloat(e.target.value) || 0 })
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
                    <td style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <label style={{ fontSize: "12px" }}>
                        {__("Min Length:", "optionbay")}{" "}
                        <ClassicInput
                          type="number"
                          size="small"
                          value={field.min_length || ""}
                          onChange={(e) =>
                            update({ min_length: parseInt(e.target.value) || 0 })
                          }
                          min={0}
                        />
                      </label>
                      <label style={{ fontSize: "12px" }}>
                        {__("Max Length:", "optionbay")}{" "}
                        <ClassicInput
                          type="number"
                          size="small"
                          value={field.max_length || ""}
                          onChange={(e) =>
                            update({ max_length: parseInt(e.target.value) || 0 })
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
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px" }}>
                        <label style={{ fontSize: "12px" }}>
                          {__("Min:", "optionbay")}{" "}
                          <ClassicInput
                            type="number"
                            size="small"
                            value={field.min_value ?? ""}
                            onChange={(e) =>
                              update({ min_value: parseFloat(e.target.value) || 0 })
                            }
                          />
                        </label>
                        <label style={{ fontSize: "12px" }}>
                          {__("Max:", "optionbay")}{" "}
                          <ClassicInput
                            type="number"
                            size="small"
                            value={field.max_value ?? ""}
                            onChange={(e) =>
                              update({ max_value: parseFloat(e.target.value) || 0 })
                            }
                          />
                        </label>
                      </div>
                      <label style={{ fontSize: "12px" }}>
                        {__("Step Value:", "optionbay")}{" "}
                        <ClassicInput
                          type="number"
                          size="small"
                          value={field.step ?? ""}
                          onChange={(e) => update({ step: parseFloat(e.target.value) || 1 })}
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
                      <th scope="row">{__("File Restrictions", "optionbay")}</th>
                      <td>
                        <label style={{ display: "block", marginBottom: "8px" }}>
                          <span style={{ fontSize: "12px", display: "block" }}>
                            {__("Allowed Extensions (comma separated):", "optionbay")}
                          </span>
                          <ClassicInput
                            size="regular"
                            value={field.allowed_types || ""}
                            onChange={(e) => update({ allowed_types: e.target.value })}
                            placeholder=".jpg,.png,.pdf"
                          />
                        </label>
                        <label style={{ display: "block" }}>
                          <span style={{ fontSize: "12px", display: "block" }}>
                            {__("Max File Size (MB):", "optionbay")}
                          </span>
                          <ClassicInput
                            type="number"
                            size="small"
                            value={field.max_file_size || ""}
                            onChange={(e) =>
                              update({ max_file_size: parseInt(e.target.value) || 5 })
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
            <ConditionEditor field={field} />
          </div>
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

  const [activeAssignmentType, setActiveAssignmentType] = useState<"product" | "category" | "tag">("product");

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
            settings: data.settings || { layout: "flat", priority: 10, active: true },
            assignments: (data.assignments || []).map((a: any) => ({
              ...a,
              target_id: parseInt(a.target_id) || 0,
              is_exclusion: !!parseInt(a.is_exclusion),
              priority: parseInt(a.priority) || 10,
            })),
          },
        });
      } catch (err) {
        dispatch({ type: "SET_ERROR", payload: __("Failed to load option group.", "optionbay") });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    loadGroup();
  }, [isEdit, params.id, dispatch]);

  // Sync initial assignment type when loading an existing group
  useEffect(() => {
    const nonGlobal = state.assignments.filter((a) => a.target_type !== "global");
    if (nonGlobal.length > 0) {
      setActiveAssignmentType(nonGlobal[0].target_type as "product" | "category" | "tag");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.settings?.priority]); // Just need to trigger once on load, priority is decent proxy since it's in the payload

  // Save handler
  const handleSave = useCallback(async () => {
    dispatch({ type: "SET_SAVING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      const payload = {
        title: state.title,
        status: state.status,
        schema: state.schema,
        settings: state.settings,
        assignments: state.assignments,
      };

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
        payload: err?.message || __("Failed to save option group.", "optionbay"),
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
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <p className="wpab-loader-container">
          <span className="spinner is-active" style={{ float: "none" }}></span>
          <br />
          {__("Loading option group...", "optionbay")}
        </p>
      </div>
    );
  }

  return (
    <div className="ob-builder wpab-ignore-preflight">
      {/* Error notice */}
      {state.error && (
        <div className="notice notice-error is-dismissible" style={{ marginBottom: "20px" }}>
          <p>{state.error}</p>
        </div>
      )}

      {/* Top bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          backgroundColor: "#fff",
          padding: "15px 20px",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <ClassicButton
          variant="secondary"
          onClick={() => navigate("/option-groups")}
        >
          ← {__("Back to List", "optionbay")}
        </ClassicButton>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={{ fontSize: "13px", color: "#646970" }}>{__("Status:", "optionbay")}</span>
          <ClassicSelect
            value={state.status}
            onChange={(val) =>
              dispatch({ type: "SET_STATUS", payload: String(val) as "publish" | "draft" })
            }
            options={[
              { value: "publish", label: __("Active", "optionbay") },
              { value: "draft", label: __("Draft", "optionbay") },
            ]}
            size="short"
          />
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
      <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
        {/* Left: Title + Fields */}
        <div style={{ flex: 1 }}>
          {/* Group Title */}
          <div className="ob-builder-title-wrapper">
            <div className="postbox">
              <div className="inside" style={{ padding: "0" }}>
                <ClassicInput
                  className="ob-builder-title-input"
                  size="large"
                  value={state.title}
                  onChange={(e) =>
                    dispatch({ type: "SET_TITLE", payload: e.target.value })
                  }
                  placeholder={__("Enter Option Group Title", "optionbay")}
                />
              </div>
            </div>
          </div>

          {/* Fields list with drag-and-drop */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="fields-list">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: "100px" }}>
                  {state.schema.length === 0 ? (
                    <div
                      className="postbox"
                      style={{
                        textAlign: "center",
                        padding: "60px 20px",
                        color: "#999",
                        borderStyle: "dashed",
                        borderColor: "#c3c4c7",
                        borderRadius: "8px",
                      }}
                    >
                      <p style={{ fontSize: "16px", marginBottom: "8px" }}>
                        {__("Your group is empty", "optionbay")}
                      </p>
                      <p style={{ fontSize: "13px" }}>
                        {__("Click the field buttons in the sidebar to start building.", "optionbay")}
                      </p>
                    </div>
                  ) : (
                    state.schema.map((field, index) => (
                      <FieldRow
                        key={field.id}
                        field={field}
                        index={index}
                      />
                    ))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* Right sidebar */}
        <div style={{ width: "320px" }}>
          {/* Add Field Section */}
          <div className="ob-sidebar-section">
            <div className="ob-sidebar-header">{__("Add Fields", "optionbay")}</div>
            <div className="ob-sidebar-content">
              <div className="ob-add-field-grid">
                {FIELD_TYPES.map((ft) => (
                  <ClassicButton
                    key={ft.value}
                    variant="secondary"
                    onClick={() => addField(ft.value)}
                  >
                    + {ft.label}
                  </ClassicButton>
                ))}
              </div>
            </div>
          </div>

          {/* Group Settings Section */}
          <div className="ob-sidebar-section">
            <div className="ob-sidebar-header">{__("Group Settings", "optionbay")}</div>
            <div className="ob-sidebar-content">
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: 600 }}>
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
                    { value: "flat", label: __("Flat (Standard)", "optionbay") },
                    { value: "accordion", label: __("Accordion", "optionbay") },
                  ]}
                  size="regular"
                />
              </div>
              <div style={{ marginBottom: "5px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: 600 }}>
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
                  style={{ width: "100%" }}
                />
              </div>
              <p className="description" style={{ margin: "5px 0 0" }}>
                {__("Determines display order on product page.", "optionbay")}
              </p>
            </div>
          </div>

          {/* Assignment Rules Section */}
          <div className="ob-sidebar-section">
            <div className="ob-sidebar-header">{__("Assignment Rules", "optionbay")}</div>
            <div className="ob-sidebar-content">
              <div style={{ marginBottom: "15px", paddingBottom: "15px", borderBottom: "1px solid #eee" }}>
                <ClassicCheckbox
                  label={__("Global (All Products)", "optionbay")}
                  checked={state.assignments.some((a) => a.target_type === "global")}
                  onChange={(checked) => {
                    if (checked) {
                      dispatch({
                        type: "SET_ASSIGNMENTS",
                        payload: [
                          { target_type: "global", target_id: 0, is_exclusion: false, priority: state.settings.priority },
                        ],
                      });
                    } else {
                      dispatch({
                        type: "SET_ASSIGNMENTS",
                        payload: state.assignments.filter((a) => a.target_type !== "global"),
                      });
                    }
                  }}
                />
              </div>

              {!state.assignments.some((a) => a.target_type === "global") && (() => {
                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {/* Assignment Type Selector */}
                    <div>
                      <label style={{ display: "block", marginBottom: "5px", fontWeight: 600, fontSize: "13px" }}>
                        {__("Assign By", "optionbay")}
                      </label>
                      <ClassicSelect
                        value={activeAssignmentType}
                        onChange={(val) => {
                          setActiveAssignmentType(val as any);
                          // Clear existing non-global assignments when switching type
                          dispatch({ type: "SET_ASSIGNMENTS", payload: [] });
                        }}
                        options={[
                          { value: "product", label: __("Products", "optionbay") },
                          { value: "category", label: __("Categories", "optionbay") },
                          { value: "tag", label: __("Tags", "optionbay") },
                        ]}
                      />
                    </div>

                    {/* Products MultiSelect */}
                    {activeAssignmentType === "product" && (
                      <div>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: 600, fontSize: "13px" }}>
                          {__("Select Products", "optionbay")}
                        </label>
                        <ClassicMultiSelect
                          value={state.assignments.filter((a) => a.target_type === "product").map((a) => a.target_id)}
                          onChange={(ids) => {
                            const productAssignments = (ids as number[]).map((id) => ({
                              target_type: "product" as const,
                              target_id: id,
                              is_exclusion: false,
                              priority: state.settings.priority,
                            }));
                            dispatch({ type: "SET_ASSIGNMENTS", payload: productAssignments });
                          }}
                          endpoint="/optionbay/v1/resources/products"
                          placeholder={__("Search products by name, ID, or SKU...", "optionbay")}
                          renderOption={renderProductOption}
                          size="regular"
                        />
                      </div>
                    )}

                    {/* Categories MultiSelect */}
                    {activeAssignmentType === "category" && (
                      <div>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: 600, fontSize: "13px" }}>
                          {__("Select Categories", "optionbay")}
                        </label>
                        <ClassicMultiSelect
                          value={state.assignments.filter((a) => a.target_type === "category").map((a) => a.target_id)}
                          onChange={(ids) => {
                            const categoryAssignments = (ids as number[]).map((id) => ({
                              target_type: "category" as const,
                              target_id: id,
                              is_exclusion: false,
                              priority: state.settings.priority,
                            }));
                            dispatch({ type: "SET_ASSIGNMENTS", payload: categoryAssignments });
                          }}
                          endpoint="/optionbay/v1/resources/categories"
                          placeholder={__("Search categories...", "optionbay")}
                          size="regular"
                        />
                      </div>
                    )}

                    {/* Tags MultiSelect */}
                    {activeAssignmentType === "tag" && (
                      <div>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: 600, fontSize: "13px" }}>
                          {__("Select Tags", "optionbay")}
                        </label>
                        <ClassicMultiSelect
                          value={state.assignments.filter((a) => a.target_type === "tag").map((a) => a.target_id)}
                          onChange={(ids) => {
                            const tagAssignments = (ids as number[]).map((id) => ({
                              target_type: "tag" as const,
                              target_id: id,
                              is_exclusion: false,
                              priority: state.settings.priority,
                            }));
                            dispatch({ type: "SET_ASSIGNMENTS", payload: tagAssignments });
                          }}
                          endpoint="/optionbay/v1/resources/tags"
                          placeholder={__("Search tags...", "optionbay")}
                          size="regular"
                        />
                      </div>
                    )}
                  </div>
                );
              })()}
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
