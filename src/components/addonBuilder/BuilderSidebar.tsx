import React from "react";
import { __ } from "@wordpress/i18n";
import { ClassicButton, ClassicSelect, ClassicInput } from "../classics";
import { useAddonContext, getDefaultField } from "../../store/AddonContext";
import { FIELD_TYPES } from "./constants";
import { FormError } from "./FormError";

export const BuilderSidebar: React.FC = () => {
  const { state, dispatch } = useAddonContext();

  const addField = (type: string) => {
    const field = getDefaultField(type);
    dispatch({ type: "ADD_FIELD", payload: field });
  };

  return (
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
            <FormError message={state.errors?.["settings.layout"]} />
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
            <FormError message={state.errors?.["settings.priority"]} />
          </div>
          <p className="description optionbay-mt-1 optionbay-mb-0">
            {__("Determines display order on product page.", "optionbay")}
          </p>
        </div>
      </div>
    </div>
  );
};
