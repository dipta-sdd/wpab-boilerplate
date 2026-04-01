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
import { CirclePlus, Trash2 } from "lucide-react";

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
    <div className="optionbay-mt-2">
      <div className="optionbay-flex optionbay-justify-between optionbay-items-center">
        <ClassicCheckbox
          label={__("Enable Conditional Logic", "optionbay")}
          checked={conditions.status === "active"}
          onChange={(checked) =>
            updateConditions({ status: checked ? "active" : "inactive" })
          }
        />
        {conditions.status === "active" && (
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
            <CirclePlus className="optionbay-size-4" />{" "}
            {__("Add Rule", "optionbay")}
          </ClassicButton>
        )}
      </div>

      {conditions.status === "active" && (
        <div className="optionbay-mt-4 optionbay-space-y-4">
          <div className="optionbay-flex optionbay-gap-2 optionbay-items-center optionbay-text-[13px]">
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
            <span>{__("this field if", "optionbay")}</span>
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
            <span>{__("of these rules match:", "optionbay")}</span>
          </div>

          <table className="optionbay-w-full optionbay-border-collapse optionbay-text-left optionbay-text-[13px]">
            <thead>
              <tr className="optionbay-border-b optionbay-border-[#e5e7eb]">
                <th className="optionbay-py-2 optionbay-font-semibold optionbay-text-[#1d2327]">
                  {__("Field", "optionbay")}
                </th>
                <th className="optionbay-py-2 optionbay-font-semibold optionbay-text-[#1d2327] optionbay-w-[150px]">
                  {__("Operator", "optionbay")}
                </th>
                <th className="optionbay-py-2 optionbay-font-semibold optionbay-text-[#1d2327]">
                  {__("Value", "optionbay")}
                </th>
                <th className="optionbay-py-2 optionbay-w-[40px]"></th>
              </tr>
            </thead>
            <tbody>
              {(conditions.rules || []).map((rule, idx) => (
                <tr
                  key={idx}
                  className="optionbay-border-b optionbay-border-[#f0f0f1] last:optionbay-border-none"
                >
                  <td className="optionbay-py-2 optionbay-pr-2">
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
                  </td>
                  <td className="optionbay-py-2 optionbay-pr-2">
                    <ClassicSelect
                      value={rule.operator}
                      onChange={(val) => {
                        const rules = [...(conditions.rules || [])];
                        rules[idx] = { ...rules[idx], operator: String(val) };
                        updateConditions({ rules });
                      }}
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
                  </td>
                  <td className="optionbay-py-2 optionbay-pr-2">
                    {!["empty", "not_empty"].includes(rule.operator) && (
                      <>
                        <ClassicInput
                          size="regular"
                          value={rule.value}
                          onChange={(e) => {
                            const rules = [...(conditions.rules || [])];
                            rules[idx] = { ...rules[idx], value: e.target.value };
                            updateConditions({ rules });
                          }}
                          placeholder={__("Value", "optionbay")}
                        />
                        <FormError
                          message={
                            state.errors?.[
                              `schema.${index}.conditions.rules.${idx}.value`
                            ]
                          }
                        />
                      </>
                    )}
                  </td>
                  <td className="optionbay-py-2">
                    <button
                      type="button"
                      onClick={() => {
                        const rules = (conditions.rules || []).filter(
                          (_, i) => i !== idx,
                        );
                        updateConditions({ rules });
                      }}
                      className="optionbay-bg-transparent optionbay-border-none optionbay-cursor-pointer optionbay-p-1 optionbay-text-[#d63638] hover:optionbay-text-[#b32d2e] optionbay-transition-colors"
                      title={__("Remove rule", "optionbay")}
                    >
                      <Trash2 className="optionbay-size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
