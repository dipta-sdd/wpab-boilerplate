import React from "react";

interface CheckboxProps {
  label?: string | React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  classNames?: {
    root?: string;
    box?: string;
    icon?: string;
    label?: string;
  };
}

export const Checkbox: React.FC<CheckboxProps> = ({
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
        optionbay-flex optionbay-items-center optionbay-justify-center
        optionbay-w-4 optionbay-h-4 optionbay-rounded optionbay-border-2 optionbay-transition-all optionbay-duration-200
        ${
          checked
            ? "optionbay-border-primary optionbay-bg-primary"
            : "optionbay-border-[#949494] optionbay-bg-transparent hover:optionbay-border-primary"
        }
        ${classNames?.box || ""}
      `}
      >
        <svg
          className={`optionbay-w-3.5 optionbay-h-3.5 optionbay-text-white optionbay-transform optionbay-transition-transform optionbay-duration-200 ${
            checked ? "optionbay-scale-100" : "optionbay-scale-0"
          } ${classNames?.icon || ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <input
          type="checkbox"
          className="!optionbay-hidden"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
      </div>
      {label && (
        <span
          className={`optionbay-text-[13px] optionbay-font-[400] optionbay-leading-[20px] optionbay-text-[#1e1e1e] ${
            classNames?.label || ""
          }`}
        >
          {label}
        </span>
      )}
    </label>
  );
};
