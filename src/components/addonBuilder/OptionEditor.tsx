import React from "react";
import { __ } from "@wordpress/i18n";
import {
  ClassicInput,
  ClassicSelect,
  ClassicButton,
} from "../classics";
import { useAddonContext, FieldOption } from "../../store/AddonContext";
import { PRICE_TYPES } from "./constants";
import { FormError } from "./FormError";

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
          <div className="optionbay-w-[80px]">
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
              message={
                state.errors?.[
                  `schema.${state.schema.findIndex(
                    (f) => f.id === fieldId,
                  )}.options.${idx}.price`
                ]
              }
            />
          </div>
          <div className="optionbay-w-[100px]">
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
              message={
                state.errors?.[
                  `schema.${state.schema.findIndex(
                    (f) => f.id === fieldId,
                  )}.options.${idx}.price_type`
                ]
              }
            />
          </div>
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
};
