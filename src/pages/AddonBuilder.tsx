import { useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { __ } from "@wordpress/i18n";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { ClassicButton, ClassicInput, ClassicSelect } from "../components/classics";
import { ClassicRepeater } from "../components/classics/ClassicRepeater";
import {
  AddonProvider,
  useAddonContext,
  getDefaultField,
  FieldDefinition,
  FieldOption,
} from "../store/AddonContext";
import apiFetch from "../utils/apiFetch";

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
    <div style={{ marginTop: "12px" }}>
      <label style={{ fontWeight: 600, display: "block", marginBottom: "8px" }}>
        {__("Choices", "optionbay")}
      </label>
      {options.map((opt, idx) => (
        <div
          key={idx}
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "6px",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            className="regular-text"
            placeholder={__("Label", "optionbay")}
            value={opt.label}
            onChange={(e) =>
              dispatch({
                type: "UPDATE_OPTION",
                payload: { fieldId, optionIndex: idx, updates: { label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, "_") } },
              })
            }
            style={{ flex: 1 }}
          />
          <input
            type="number"
            className="small-text"
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
            style={{ width: "80px" }}
          />
          <select
            value={opt.price_type}
            onChange={(e) =>
              dispatch({
                type: "UPDATE_OPTION",
                payload: {
                  fieldId,
                  optionIndex: idx,
                  updates: { price_type: e.target.value },
                },
              })
            }
            style={{ width: "100px" }}
          >
            {PRICE_TYPES.map((pt) => (
              <option key={pt.value} value={pt.value}>
                {pt.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="button"
            onClick={() =>
              dispatch({
                type: "REMOVE_OPTION",
                payload: { fieldId, optionIndex: idx },
              })
            }
            style={{ color: "#b32d2e" }}
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        className="button"
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
      </button>
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
      <p style={{ color: "#666", fontStyle: "italic", marginTop: "12px" }}>
        {__("Add more fields to set up conditional logic.", "optionbay")}
      </p>
    );
  }

  return (
    <div style={{ marginTop: "12px", padding: "12px", backgroundColor: "#f9f9f9", border: "1px solid #ddd" }}>
      <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "10px" }}>
        <label>
          <input
            type="checkbox"
            checked={conditions.status === "active"}
            onChange={(e) =>
              updateConditions({ status: e.target.checked ? "active" : "inactive" })
            }
          />{" "}
          {__("Enable Conditional Logic", "optionbay")}
        </label>
      </div>

      {conditions.status === "active" && (
        <>
          <div style={{ display: "flex", gap: "8px", marginBottom: "10px", alignItems: "center" }}>
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
            <div key={idx} style={{ display: "flex", gap: "8px", marginBottom: "6px", alignItems: "center" }}>
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
                style={{ width: "100px" }}
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
                <input
                  type="text"
                  className="regular-text"
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
                className="button"
                onClick={() => {
                  const rules = (conditions.rules || []).filter((_, i) => i !== idx);
                  updateConditions({ rules });
                }}
                style={{ color: "#b32d2e" }}
              >
                ×
              </button>
            </div>
          ))}

          <button
            type="button"
            className="button"
            onClick={() => {
              const rules = [
                ...(conditions.rules || []),
                { target_field_id: "", operator: "==", value: "" },
              ];
              updateConditions({ rules });
            }}
          >
            + {__("Add Rule", "optionbay")}
          </button>
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
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="postbox"
          style={{
            ...provided.draggableProps.style,
            marginBottom: "12px",
          }}
        >
          {/* Header */}
          <div
            className="postbox-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 12px",
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                {...provided.dragHandleProps}
                style={{ cursor: "grab", fontSize: "16px" }}
              >
                ☰
              </span>
              <strong>
                {field.label || `${__("Untitled", "optionbay")} ${field.type}`}
              </strong>
              <span style={{ color: "#999", fontSize: "12px" }}>
                ({field.type})
              </span>
              {field.required && (
                <span style={{ color: "#c00", fontSize: "12px" }}>*</span>
              )}
            </div>
            <button
              type="button"
              className="button"
              onClick={() => dispatch({ type: "REMOVE_FIELD", payload: field.id })}
              style={{ color: "#b32d2e", fontSize: "12px" }}
            >
              {__("Remove", "optionbay")}
            </button>
          </div>

          {/* Body */}
          <div className="inside" style={{ padding: "12px" }}>
            <table className="form-table" style={{ margin: 0 }}>
              <tbody>
                {/* Type */}
                <tr>
                  <th scope="row">{__("Type", "optionbay")}</th>
                  <td>
                    <select
                      value={field.type}
                      onChange={(e) => {
                        const newType = e.target.value;
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
                    >
                      {FIELD_TYPES.map((ft) => (
                        <option key={ft.value} value={ft.value}>
                          {ft.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>

                {/* Label */}
                <tr>
                  <th scope="row">{__("Label", "optionbay")}</th>
                  <td>
                    <input
                      type="text"
                      className="regular-text"
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
                  <th scope="row">{__("Required", "optionbay")}</th>
                  <td>
                    <label>
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => update({ required: e.target.checked })}
                      />{" "}
                      {__("This field must be filled", "optionbay")}
                    </label>
                  </td>
                </tr>

                {/* Placeholder (text/textarea/number) */}
                {["text", "textarea", "number", "email"].includes(field.type) && (
                  <tr>
                    <th scope="row">{__("Placeholder", "optionbay")}</th>
                    <td>
                      <input
                        type="text"
                        className="regular-text"
                        value={field.placeholder}
                        onChange={(e) => update({ placeholder: e.target.value })}
                      />
                    </td>
                  </tr>
                )}

                {/* Pricing (for field-level pricing on non-option fields) */}
                {!hasOptions && (
                  <>
                    <tr>
                      <th scope="row">{__("Price Type", "optionbay")}</th>
                      <td>
                        <select
                          value={field.price_type}
                          onChange={(e) => update({ price_type: e.target.value })}
                        >
                          {PRICE_TYPES.map((pt) => (
                            <option key={pt.value} value={pt.value}>
                              {pt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                    {field.price_type !== "none" && (
                      <tr>
                        <th scope="row">{__("Price", "optionbay")}</th>
                        <td>
                          <input
                            type="number"
                            className="small-text"
                            value={field.price || ""}
                            onChange={(e) =>
                              update({ price: parseFloat(e.target.value) || 0 })
                            }
                            step="0.01"
                          />
                        </td>
                      </tr>
                    )}
                  </>
                )}

                {/* Min/Max for text */}
                {["text", "textarea"].includes(field.type) && (
                  <tr>
                    <th scope="row">{__("Character Limits", "optionbay")}</th>
                    <td style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <input
                        type="number"
                        className="small-text"
                        value={field.min_length || ""}
                        onChange={(e) => update({ min_length: parseInt(e.target.value) || 0 })}
                        placeholder="Min"
                        min={0}
                      />
                      <span>—</span>
                      <input
                        type="number"
                        className="small-text"
                        value={field.max_length || ""}
                        onChange={(e) => update({ max_length: parseInt(e.target.value) || 0 })}
                        placeholder="Max"
                        min={0}
                      />
                    </td>
                  </tr>
                )}

                {/* Min/Max/Step for number */}
                {field.type === "number" && (
                  <tr>
                    <th scope="row">{__("Range", "optionbay")}</th>
                    <td style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <input
                        type="number"
                        className="small-text"
                        value={field.min_value ?? ""}
                        onChange={(e) => update({ min_value: parseFloat(e.target.value) || 0 })}
                        placeholder="Min"
                      />
                      <span>—</span>
                      <input
                        type="number"
                        className="small-text"
                        value={field.max_value ?? ""}
                        onChange={(e) => update({ max_value: parseFloat(e.target.value) || 0 })}
                        placeholder="Max"
                      />
                      <span>{__("Step:", "optionbay")}</span>
                      <input
                        type="number"
                        className="small-text"
                        value={field.step ?? ""}
                        onChange={(e) => update({ step: parseFloat(e.target.value) || 1 })}
                        placeholder="1"
                        step="0.01"
                      />
                    </td>
                  </tr>
                )}

                {/* File settings */}
                {field.type === "file" && (
                  <>
                    <tr>
                      <th scope="row">{__("Allowed Types", "optionbay")}</th>
                      <td>
                        <input
                          type="text"
                          className="regular-text"
                          value={field.allowed_types || ""}
                          onChange={(e) => update({ allowed_types: e.target.value })}
                          placeholder=".jpg,.png,.pdf"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">{__("Max Size (MB)", "optionbay")}</th>
                      <td>
                        <input
                          type="number"
                          className="small-text"
                          value={field.max_file_size || ""}
                          onChange={(e) => update({ max_file_size: parseInt(e.target.value) || 5 })}
                          min={1}
                        />
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
      <div style={{ textAlign: "center", padding: "60px" }}>
        <p>{__("Loading option group...", "optionbay")}</p>
      </div>
    );
  }

  return (
    <div className="wpab-ignore-preflight">
      {/* Error notice */}
      {state.error && (
        <div className="notice notice-error" style={{ marginBottom: "16px" }}>
          <p>{state.error}</p>
        </div>
      )}

      {/* Top bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <ClassicButton
          variant="secondary"
          onClick={() => navigate("/option-groups")}
        >
          ← {__("Back to List", "optionbay")}
        </ClassicButton>
        <div style={{ display: "flex", gap: "8px" }}>
          <select
            value={state.status}
            onChange={(e) =>
              dispatch({ type: "SET_STATUS", payload: e.target.value as "publish" | "draft" })
            }
          >
            <option value="publish">{__("Active", "optionbay")}</option>
            <option value="draft">{__("Draft", "optionbay")}</option>
          </select>
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
      <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
        {/* Left: Title + Fields */}
        <div style={{ flex: 1 }}>
          {/* Group Title */}
          <div className="postbox" style={{ marginBottom: "16px" }}>
            <div className="inside" style={{ padding: "12px" }}>
              <input
                type="text"
                className="large-text"
                value={state.title}
                onChange={(e) =>
                  dispatch({ type: "SET_TITLE", payload: e.target.value })
                }
                placeholder={__("Option Group Title", "optionbay")}
                style={{ fontSize: "18px", padding: "8px 12px" }}
              />
            </div>
          </div>

          {/* Fields list with drag-and-drop */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="fields-list">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {state.schema.length === 0 ? (
                    <div
                      className="postbox"
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "#999",
                      }}
                    >
                      <p>{__("No fields yet. Add a field from the sidebar.", "optionbay")}</p>
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
        <div style={{ width: "280px", flexShrink: 0 }}>
          {/* Add Field */}
          <div className="postbox" style={{ marginBottom: "16px" }}>
            <h3 className="hndle" style={{ padding: "8px 12px", margin: 0 }}>
              {__("Add Field", "optionbay")}
            </h3>
            <div className="inside" style={{ padding: "12px" }}>
              {FIELD_TYPES.map((ft) => (
                <button
                  key={ft.value}
                  type="button"
                  className="button"
                  onClick={() => addField(ft.value)}
                  style={{
                    display: "block",
                    width: "100%",
                    marginBottom: "6px",
                    textAlign: "left",
                  }}
                >
                  + {ft.label}
                </button>
              ))}
            </div>
          </div>

          {/* Group Settings */}
          <div className="postbox" style={{ marginBottom: "16px" }}>
            <h3 className="hndle" style={{ padding: "8px 12px", margin: 0 }}>
              {__("Group Settings", "optionbay")}
            </h3>
            <div className="inside" style={{ padding: "12px" }}>
              <p>
                <label>
                  <strong>{__("Display Layout", "optionbay")}</strong>
                </label>
                <select
                  value={state.settings.layout}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_SETTINGS",
                      payload: { layout: e.target.value as "flat" | "accordion" },
                    })
                  }
                  style={{ width: "100%", marginTop: "4px" }}
                >
                  <option value="flat">{__("Flat (all fields visible)", "optionbay")}</option>
                  <option value="accordion">{__("Accordion (collapsible)", "optionbay")}</option>
                </select>
              </p>
              <p>
                <label>
                  <strong>{__("Priority", "optionbay")}</strong>
                </label>
                <input
                  type="number"
                  className="small-text"
                  value={state.settings.priority}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_SETTINGS",
                      payload: { priority: parseInt(e.target.value) || 10 },
                    })
                  }
                  style={{ width: "100%", marginTop: "4px" }}
                />
                <span className="description">
                  {__("Lower = displays first", "optionbay")}
                </span>
              </p>
            </div>
          </div>

          {/* Assignment Rules */}
          <div className="postbox">
            <h3 className="hndle" style={{ padding: "8px 12px", margin: 0 }}>
              {__("Assignment Rules", "optionbay")}
            </h3>
            <div className="inside" style={{ padding: "12px" }}>
              {/* Global toggle */}
              <p>
                <label>
                  <input
                    type="checkbox"
                    checked={state.assignments.some((a) => a.target_type === "global")}
                    onChange={(e) => {
                      if (e.target.checked) {
                        dispatch({
                          type: "SET_ASSIGNMENTS",
                          payload: [
                            ...state.assignments.filter((a) => a.target_type !== "global"),
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
                  />{" "}
                  <strong>{__("All Products (Global)", "optionbay")}</strong>
                </label>
              </p>

              {/* Specific assignments */}
              {!state.assignments.some((a) => a.target_type === "global") && (
                <>
                  <hr />
                  <p className="description">
                    {__("Or assign to specific products/categories by ID:", "optionbay")}
                  </p>

                  {state.assignments
                    .filter((a) => a.target_type !== "global")
                    .map((assignment, idx) => (
                      <div key={idx} style={{ display: "flex", gap: "4px", marginBottom: "6px", alignItems: "center" }}>
                        <select
                          value={assignment.target_type}
                          onChange={(e) => {
                            const newAssignments = [...state.assignments];
                            const globalCount = newAssignments.filter((a) => a.target_type === "global").length;
                            const realIdx = globalCount + idx;
                            newAssignments[realIdx] = {
                              ...newAssignments[realIdx],
                              target_type: e.target.value as any,
                            };
                            dispatch({ type: "SET_ASSIGNMENTS", payload: newAssignments });
                          }}
                          style={{ width: "90px" }}
                        >
                          <option value="product">{__("Product", "optionbay")}</option>
                          <option value="category">{__("Category", "optionbay")}</option>
                          <option value="tag">{__("Tag", "optionbay")}</option>
                        </select>
                        <input
                          type="number"
                          className="small-text"
                          value={assignment.target_id || ""}
                          onChange={(e) => {
                            const newAssignments = [...state.assignments];
                            const globalCount = newAssignments.filter((a) => a.target_type === "global").length;
                            const realIdx = globalCount + idx;
                            newAssignments[realIdx] = {
                              ...newAssignments[realIdx],
                              target_id: parseInt(e.target.value) || 0,
                            };
                            dispatch({ type: "SET_ASSIGNMENTS", payload: newAssignments });
                          }}
                          placeholder="ID"
                          style={{ width: "60px" }}
                        />
                        <label style={{ fontSize: "12px" }}>
                          <input
                            type="checkbox"
                            checked={assignment.is_exclusion}
                            onChange={(e) => {
                              const newAssignments = [...state.assignments];
                              const globalCount = newAssignments.filter((a) => a.target_type === "global").length;
                              const realIdx = globalCount + idx;
                              newAssignments[realIdx] = {
                                ...newAssignments[realIdx],
                                is_exclusion: e.target.checked,
                              };
                              dispatch({ type: "SET_ASSIGNMENTS", payload: newAssignments });
                            }}
                          />{" "}
                          {__("Exclude", "optionbay")}
                        </label>
                        <button
                          type="button"
                          className="button"
                          onClick={() => {
                            const newAssignments = [...state.assignments];
                            const globalCount = newAssignments.filter((a) => a.target_type === "global").length;
                            newAssignments.splice(globalCount + idx, 1);
                            dispatch({ type: "SET_ASSIGNMENTS", payload: newAssignments });
                          }}
                          style={{ color: "#b32d2e" }}
                        >
                          ×
                        </button>
                      </div>
                    ))}

                  <button
                    type="button"
                    className="button"
                    onClick={() => {
                      dispatch({
                        type: "SET_ASSIGNMENTS",
                        payload: [
                          ...state.assignments,
                          { target_type: "product", target_id: 0, is_exclusion: false, priority: state.settings.priority },
                        ],
                      });
                    }}
                    style={{ marginTop: "4px" }}
                  >
                    + {__("Add Assignment", "optionbay")}
                  </button>
                </>
              )}
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
