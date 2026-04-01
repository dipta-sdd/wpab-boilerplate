import React from "react";
import { __ } from "@wordpress/i18n";
import { ClassicInput, ClassicSelect, ClassicButton } from "../classics";
import { useAddonContext, FieldOption } from "../../store/AddonContext";
import { PRICE_TYPES } from "./constants";
import { FormError } from "./FormError";
import { CirclePlus, Trash2 } from "lucide-react";

interface OptionEditorProps {
  fieldId: string;
  options: FieldOption[];
  hideLabel?: boolean;
}

export const OptionEditor: React.FC<OptionEditorProps> = ({
  fieldId,
  options,
  hideLabel = false,
}) => {
  const { state, dispatch } = useAddonContext();
  const fieldIndex = state.schema.findIndex((f) => f.id === fieldId);

  return (
    <div
      className={`optionbay-flex optionbay-flex-col optionbay-gap-2.5 ${
        !hideLabel ? "optionbay-mt-4" : ""
      }`}
    >
      {!hideLabel && (
        <label className="optionbay-font-semibold optionbay-block">
          {__("Choices", "optionbay")}
        </label>
      )}

      <table className="optionbay-w-full optionbay-border-collapse optionbay-text-left optionbay-text-[13px]">
        <thead>
          <tr className="optionbay-border-b optionbay-border-[#e5e7eb]">
            <th className="optionbay-py-2 optionbay-font-semibold optionbay-text-[#1d2327]">
              {__("Label", "optionbay")}
            </th>
            <th className="optionbay-py-2 optionbay-font-semibold optionbay-text-[#1d2327] optionbay-w-[100px]">
              {__("Price", "optionbay")}
            </th>
            <th className="optionbay-py-2 optionbay-font-semibold optionbay-text-[#1d2327] optionbay-w-[160px]">
              {__("Price Type", "optionbay")}
            </th>
            {/* Optional Weight column if needed */}
            <th className="optionbay-py-2 optionbay-font-semibold optionbay-text-[#1d2327] optionbay-w-[80px]">
              {__("Weight", "optionbay")}
            </th>
            <th className="optionbay-py-2 optionbay-font-semibold optionbay-text-[#1d2327] optionbay-w-[40px]"></th>
          </tr>
        </thead>
        <tbody>
          {options.map((opt, idx) => (
            <tr
              key={idx}
              className="optionbay-border-b optionbay-border-[#f0f0f1] last:optionbay-border-none"
            >
              <td className="optionbay-py-2 optionbay-pr-2">
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
                          value: e.target.value
                            .toLowerCase()
                            .replace(/\s+/g, "_"),
                        },
                      },
                    })
                  }
                />
                <FormError
                  message={state.errors?.[`schema.${fieldIndex}.options.${idx}.label`]}
                />
              </td>
              <td className="optionbay-py-2 optionbay-pr-2">
                {opt.price_type !== "none" && (
                  <>
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
                    <FormError
                      message={state.errors?.[`schema.${fieldIndex}.options.${idx}.price`]}
                    />
                  </>
                )}
              </td>
              <td className="optionbay-py-2 optionbay-pr-2">
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
                <FormError
                  message={state.errors?.[`schema.${fieldIndex}.options.${idx}.price_type`]}
                />
              </td>
              <td className="optionbay-py-2 optionbay-pr-2">
                <ClassicInput
                  type="number"
                  size="small"
                  placeholder={__("Weight", "optionbay")}
                  value={opt.weight || ""}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_OPTION",
                      payload: {
                        fieldId,
                        optionIndex: idx,
                        updates: { weight: parseFloat(e.target.value) || 0 },
                      },
                    })
                  }
                />
              </td>
              <td className="optionbay-py-2">
                <button
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: "REMOVE_OPTION",
                      payload: { fieldId, optionIndex: idx },
                    })
                  }
                  className="optionbay-bg-transparent optionbay-border-none optionbay-cursor-pointer optionbay-p-1 optionbay-text-[#d63638] hover:optionbay-text-[#b32d2e] optionbay-transition-colors"
                  title={__("Remove choice", "optionbay")}
                >
                  <Trash2 className="optionbay-size-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="optionbay-flex optionbay-justify-start">
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
                  price_type: "none",
                  price: 0,
                  weight: 0,
                },
              },
            })
          }
        >
          <CirclePlus className="optionbay-size-4" /> {__("Add Choice", "optionbay")}
        </ClassicButton>
      </div>

      <FormError message={state.errors?.[`schema.${fieldIndex}.options`]} />
    </div>
  );
};
