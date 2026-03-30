import React from "react";
import { __ } from "@wordpress/i18n";
import {
  ClassicCheckbox,
  ClassicSelect,
  ClassicInput,
  ClassicButton,
} from "../classics";
import { useAddonContext, FieldDefinition } from "../../store/AddonContext";
import { FormError } from "./FormError";

interface ConditionEditorProps {
  field: FieldDefinition;
  index: number;
  hideLabel?: boolean;
}

export const ConditionEditor: React.FC<ConditionEditorProps> = ({
  field,
  index,
  hideLabel = false,
}) => {
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
      <p
        className={`optionbay-text-[#666] optionbay-italic ${
          !hideLabel ? "optionbay-mt-4" : ""
        }`}
      >
        {__("Add more fields to set up conditional logic.", "optionbay")}
      </p>
    );
  }

  return (
    <>
      <div className="optionbay-mt-[5px]">
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
        <div
          className={`optionbay-mt-[15px]  optionbay-p-[15px] optionbay-bg-[#f0f6fb] optionbay-border optionbay-border-[#c8d7e1] optionbay-rounded-md optionbay-flex optionbay-flex-col optionbay-gap-3 optionbay-transition-all optionbay-duration-300 optionbay-ease-in-out`}
        >
          <div className="optionbay-flex optionbay-gap-2 optionbay-items-center">
            <div className="optionbay-flex-col">
              <ClassicSelect
                value={conditions.action}
                classNames={{ innerContainer: "!optionbay-w-[85px]" }}
                onChange={(val) =>
                  updateConditions({ action: val as "show" | "hide" })
                }
                options={[
                  { value: "show", label: __("Show", "optionbay") },
                  { value: "hide", label: __("Hide", "optionbay") },
                ]}
              />
              <FormError
                message={state.errors?.[`schema.${index}.conditions.action`]}
              />
            </div>
            <span>{__("this field if", "optionbay")}</span>
            <div className="optionbay-flex-col">
              <ClassicSelect
                value={conditions.match}
                classNames={{ innerContainer: "!optionbay-w-[85px]" }}
                onChange={(val) =>
                  updateConditions({ match: val as "ALL" | "ANY" })
                }
                options={[
                  { value: "ALL", label: __("ALL", "optionbay") },
                  { value: "ANY", label: __("ANY", "optionbay") },
                ]}
              />
              <FormError
                message={state.errors?.[`schema.${index}.conditions.match`]}
              />
            </div>
            <span>{__("of these rules match:", "optionbay")}</span>
          </div>

          {(conditions.rules || []).map((rule, idx) => (
            <div
              key={idx}
              className="optionbay-flex optionbay-flex-col optionbay-gap-1"
            >
              <div className="optionbay-flex optionbay-gap-2 optionbay-items-center">
                <div className="optionbay-flex-1">
                  <ClassicSelect
                    value={rule.target_field_id}
                    onChange={(val) => {
                      const rules = [...(conditions.rules || [])];
                      rules[idx] = {
                        ...rules[idx],
                        target_field_id: String(val),
                      };
                      updateConditions({ rules });
                    }}
                    className="optionbay-flex-1"
                    options={[
                      {
                        value: "",
                        label: __("Select field...", "optionbay"),
                      },
                      ...siblingFields.map((sf) => ({
                        value: sf.id,
                        label: sf.label || sf.id,
                      })),
                    ]}
                  />
                  <FormError
                    message={
                      state.errors?.[
                        `schema.${index}.conditions.rules.${idx}.target_field_id`
                      ]
                    }
                  />
                </div>
                <div className="optionbay-flex-col">
                  <ClassicSelect
                    value={rule.operator}
                    onChange={(val) => {
                      const rules = [...(conditions.rules || [])];
                      rules[idx] = { ...rules[idx], operator: String(val) };
                      updateConditions({ rules });
                    }}
                    classNames={{ innerContainer: "!optionbay-w-[140px]" }}
                    options={[
                      { value: "==", label: __("equals", "optionbay") },
                      { value: "!=", label: __("not equals", "optionbay") },
                      { value: ">", label: __("greater than", "optionbay") },
                      { value: "<", label: __("less than", "optionbay") },
                      {
                        value: "contains",
                        label: __("contains", "optionbay"),
                      },
                      { value: "empty", label: __("is empty", "optionbay") },
                      {
                        value: "not_empty",
                        label: __("is not empty", "optionbay"),
                      },
                    ]}
                  />
                  <FormError
                    message={
                      state.errors?.[
                        `schema.${index}.conditions.rules.${idx}.operator`
                      ]
                    }
                  />
                </div>
                {!["empty", "not_empty"].includes(rule.operator) && (
                  <div className="optionbay-flex-1">
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
                    <FormError
                      message={
                        state.errors?.[
                          `schema.${index}.conditions.rules.${idx}.value`
                        ]
                      }
                    />
                  </div>
                )}
                <button
                  type="button"
                  className="optionbay-text-[#b32d2e] hover:optionbay-bg-[#f1f1f1] optionbay-rounded optionbay-border-none optionbay-bg-transparent optionbay-cursor-pointer optionbay-text-[18px] optionbay-w-8 optionbay-h-8 optionbay-flex optionbay-items-center optionbay-justify-center"
                  onClick={() => {
                    const rules = (conditions.rules || []).filter(
                      (_, i) => i !== idx,
                    );
                    updateConditions({ rules });
                  }}
                  title={__("Remove rule", "optionbay")}
                >
                  ×
                </button>
              </div>
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
        </div>
      )}
    </>
  );
};
