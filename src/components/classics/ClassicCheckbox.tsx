import React from "react";

interface ClassicCheckboxProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  description?: string;
  className?: string;
  id?: string;
}

export const ClassicCheckbox: React.FC<ClassicCheckboxProps> = ({
  label,
  checked,
  onChange,
  disabled,
  description,
  className = "",
  id,
}) => {
  const checkboxId =
    id || `classic-cb-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <div
      className={`optionbay-flex optionbay-flex-col optionbay-gap-1 ${className}`}
    >
      <label
        htmlFor={checkboxId}
        className={`optionbay-flex optionbay-items-center optionbay-gap-2 optionbay-cursor-pointer ${
          disabled ? "optionbay-opacity-50 optionbay-cursor-not-allowed" : ""
        }`}
      >
        <div
          className={`
          optionbay-flex optionbay-items-center optionbay-justify-center
          optionbay-w-4 optionbay-h-4 optionbay-rounded optionbay-border-2 optionbay-transition-all optionbay-duration-200
          ${
            checked
              ? "optionbay-border-[#2271b1] optionbay-bg-[#2271b1]"
              : "optionbay-border-[#8c8f94] optionbay-bg-white hover:optionbay-border-[#2271b1]"
          }
        `}
        >
          <svg
            className={`optionbay-w-3.5 optionbay-h-3.5 optionbay-text-white optionbay-transform optionbay-transition-transform optionbay-duration-200 ${
              checked ? "optionbay-scale-100" : "optionbay-scale-0"
            }`}
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
            id={checkboxId}
            type="checkbox"
            className="!optionbay-hidden"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
          />
        </div>
        {label && <span>{label}</span>}
      </label>
      {description && (
        <p
          className="description optionbay-block optionbay-mt-0 optionbay-pl-6"
        >
          {description}
        </p>
      )}
    </div>
  );
};
