import React from "react";

interface RadioProps {
  label: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  classNames?: {
    root?: string;
    circle?: string;
    dot?: string;
    label?: string;
  };
}

export const Radio: React.FC<RadioProps> = ({
  label,
  checked,
  onChange,
  disabled,
  classNames,
}) => {
  return (
    <label
      className={`optionbay-flex optionbay-items-center optionbay-gap-3 optionbay-cursor-pointer ${
        disabled ? "optionbay-opacity-50 optionbay-cursor-not-allowed" : ""
      } ${classNames?.root || ""}`}
    >
      <div
        className={`
        optionbay-relative optionbay-flex optionbay-items-center optionbay-justify-center
        optionbay-w-5 optionbay-h-5 optionbay-rounded-full optionbay-border-2 optionbay-transition-all optionbay-duration-200
        ${
          checked
            ? "optionbay-border-primary optionbay-bg-primary"
            : "optionbay-border-gray-300 optionbay-bg-white hover:optionbay-border-primary"
        }
        ${classNames?.circle || ""}
      `}
      >
        {/* Inner white dot for selected state */}
        <div
          className={`
                optionbay-w-2 optionbay-h-2 optionbay-bg-white optionbay-rounded-full optionbay-transform optionbay-transition-transform optionbay-duration-200
                ${checked ? "optionbay-scale-100" : "optionbay-scale-0"}
                ${classNames?.dot || ""}
            `}
        />
        <input
          type="radio"
          className="optionbay-hidden"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
        />
      </div>
      <span
        className={`optionbay-text-[15px] optionbay-font-semibold ${
          checked ? "optionbay-text-gray-900" : "optionbay-text-gray-700"
        } ${classNames?.label || ""}`}
      >
        {label}
      </span>
    </label>
  );
};
