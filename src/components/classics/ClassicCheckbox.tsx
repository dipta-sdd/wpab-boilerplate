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
    <div className={`wpab-flex wpab-flex-col wpab-gap-1 ${className}`}>
      <label
        htmlFor={checkboxId}
        className={`wpab-flex wpab-items-center wpab-gap-2 wpab-cursor-pointer ${
          disabled ? "wpab-opacity-50 wpab-cursor-not-allowed" : ""
        }`}
      >
        <div
          className={`
          wpab-flex wpab-items-center wpab-justify-center
          wpab-w-4 wpab-h-4 wpab-rounded wpab-border-2 wpab-transition-all wpab-duration-200
          ${
            checked
              ? "wpab-border-[#2271b1] wpab-bg-[#2271b1]"
              : "wpab-border-[#8c8f94] wpab-bg-white hover:wpab-border-[#2271b1]"
          }
        `}
        >
          <svg
            className={`wpab-w-3.5 wpab-h-3.5 wpab-text-white wpab-transform wpab-transition-transform wpab-duration-200 ${
              checked ? "wpab-scale-100" : "wpab-scale-0"
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
            className="!wpab-hidden"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
          />
        </div>
        {label && (
          <span className="wpab-text-[13px] wpab-font-[400] wpab-leading-[20px] wpab-text-[#1e1e1e]">
            {label}
          </span>
        )}
      </label>
      {description && (
        <p
          className="description"
          style={{ display: "block", marginTop: 0, paddingLeft: "24px" }}
        >
          {description}
        </p>
      )}
    </div>
  );
};
