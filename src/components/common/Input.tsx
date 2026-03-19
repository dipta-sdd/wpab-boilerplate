import React from "react";
import {
  borderClasses,
  errorClasses,
  hoverClasses,
  transitionClasses,
} from "./classes";

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  size?: "small" | "medium" | "large";
  classNames?: {
    root?: string;
    label?: string;
    input?: string;
    error?: string;
  };
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  size = "medium",
  className = "",
  classNames,
  ...props
}) => {
  const sizeClasses = {
    small:
      "optionbay-px-[8px] !optionbay-py-[7px] optionbay-text-[13px] optionbay-leading-[20px]",
    medium:
      "optionbay-px-[12px] !optionbay-py-[9px] !optionbay-text-[13px] !optionbay-leading-[20px]",
    large:
      "optionbay-px-[12px] !optionbay-py-[11px] optionbay-text-[13px] optionbay-leading-[20px]",
  };

  return (
    <div className={`optionbay-w-full ${classNames?.root || ""}`}>
      {label && (
        <label
          className={`optionbay-block optionbay-text-sm optionbay-font-bold optionbay-text-gray-900 optionbay-mb-2 ${
            classNames?.label || ""
          }`}
        >
          {label}
        </label>
      )}
      <input
        className={`
          optionbay-w-full optionbay-outline-none
          optionbay-bg-white optionbay-border optionbay-rounded-[8px]
          optionbay-text-[#1e1e1e] optionbay-placeholder-gray-400
          ${sizeClasses[size]}
          ${borderClasses}
          ${transitionClasses}
          ${error ? errorClasses : hoverClasses}
          ${
            props.disabled
              ? "optionbay-opacity-50 optionbay-cursor-not-allowed"
              : ""
          }
          ${className}
          ${classNames?.input || ""}
        `}
        {...props}
      />
      {error && (
        <span
          className={`optionbay-mt-1 optionbay-text-xs optionbay-text-red-500 ${
            classNames?.error || ""
          }`}
        >
          {error}
        </span>
      )}
    </div>
  );
};
