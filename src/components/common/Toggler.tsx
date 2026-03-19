import React, { useState, useRef, useEffect } from "react";
import { borderClasses } from "./classes";

export interface TogglerOption {
  label: React.ReactNode;
  value: string | number;
}

interface TogglerProps {
  options: TogglerOption[];
  value: string | number;
  onChange: (value: any) => void;
  className?: string;
  fullWidth?: boolean;
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  classNames?: {
    root?: string;
    pill?: string;
    button?: string;
  };
}

export const Toggler: React.FC<TogglerProps> = ({
  options,
  value,
  onChange,
  className = "",
  fullWidth = false,
  size = "medium",
  disabled = false,
  classNames = {},
}) => {
  const [pillStyle, setPillStyle] = useState<{
    left: number;
    width: number;
  } | null>(null);
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  // Size configuration
  const sizeClasses = {
    small: "optionbay-px-[8px] optionbay-py-[2px] optionbay-text-[11px]",
    medium: "optionbay-px-[18px] optionbay-py-[5px] optionbay-text-default",
    large: "optionbay-px-[20px] optionbay-py-[12px] optionbay-text-[15px]",
  };

  useEffect(() => {
    // Find the currently selected element
    const activeIndex = options.findIndex((opt) => opt.value === value);
    const activeEl = itemsRef.current[activeIndex];

    if (activeEl) {
      // Update pill position and width based on the active element's dimensions
      setPillStyle({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
      });
    }
  }, [value, options, size]); // Recalculate when value, options, or size changes

  return (
    <div
      className={`
        optionbay-relative optionbay-inline-flex optionbay-items-center
        optionbay-bg-white optionbay-border ${borderClasses} optionbay-rounded-[8px]
        optionbay-p-[4px] optionbay-select-none
        ${fullWidth ? "optionbay-flex optionbay-w-full" : ""}
        ${
          disabled
            ? "optionbay-opacity-50 optionbay-cursor-not-allowed optionbay-pointer-events-none"
            : ""
        }
        ${className}
        ${classNames.root || ""}
      `}
      role="group"
      aria-disabled={disabled}
    >
      {/* Sliding Background Pill */}
      <div
        className={`
            optionbay-absolute optionbay-top-[4px] optionbay-bottom-[4px]
            optionbay-bg-primary optionbay-rounded-[6px] optionbay-shadow-sm
            optionbay-transition-all optionbay-duration-300 optionbay-ease-[cubic-bezier(0.4,0,0.2,1)]
            optionbay-pointer-events-none
            ${classNames.pill || ""}
        `}
        style={{
          left: pillStyle?.left ?? 0,
          width: pillStyle?.width ?? 0,
          opacity: pillStyle ? 1 : 0, // Prevent initial flash at wrong position
        }}
      />

      {options.map((option, index) => {
        const isSelected = option.value === value;
        return (
          <button
            key={String(option.value)}
            ref={(el) => {
              itemsRef.current[index] = el;
            }}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && onChange(option.value)}
            className={`
              optionbay-relative optionbay-z-10 optionbay-flex-1
              optionbay-font-medium optionbay-text-nowrap optionbay-rounded-[6px]
              optionbay-transition-colors optionbay-duration-300
              focus:optionbay-outline-none focus-visible:optionbay-ring-2 focus-visible:optionbay-ring-primary/20
              ${sizeClasses[size]}
              ${
                isSelected
                  ? "optionbay-text-white"
                  : "optionbay-text-secondary hover:optionbay-text-gray-700"
              }
              ${classNames.button || ""}
            `}
            aria-pressed={isSelected}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
