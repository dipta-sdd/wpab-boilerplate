import React from "react";
import { useNavigate } from "react-router-dom";
import { __ } from "@wordpress/i18n";
import { ClassicButton } from "../classics";
import { useAddonContext } from "../../store/AddonContext";

interface BuilderHeaderProps {
  handleSave: () => void;
  isEdit: boolean;
}

export const BuilderHeader: React.FC<BuilderHeaderProps> = ({
  handleSave,
  isEdit,
}) => {
  const { state, dispatch } = useAddonContext();
  const navigate = useNavigate();

  return (
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
  );
};
