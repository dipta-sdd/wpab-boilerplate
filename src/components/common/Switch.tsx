import React from "react";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: "small" | "medium" | "large";
  className?: string;
  classNames?: {
    root?: string;
    thumb?: string;
  };
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  disabled,
  size = "medium",
  className = "",
  classNames,
}) => {
  const sizeConfig = {
    small: {
      switch: "optionbay-h-4 optionbay-w-7",
      thumb: "optionbay-h-3 optionbay-w-3",
      translate: "optionbay-translate-x-3",
    },
    medium: {
      switch: "optionbay-h-6 optionbay-w-11",
      thumb: "optionbay-h-5 optionbay-w-5",
      translate: "optionbay-translate-x-5",
    },
    large: {
      switch: "optionbay-h-7 optionbay-w-14",
      thumb: "optionbay-h-6 optionbay-w-6",
      translate: "optionbay-translate-x-7",
    },
  };

  const currentSize = sizeConfig[size];

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`
        optionbay-group optionbay-relative optionbay-inline-flex optionbay-shrink-0 optionbay-cursor-pointer optionbay-items-center optionbay-rounded-full optionbay-border-2 optionbay-border-transparent optionbay-transition-colors optionbay-duration-200 optionbay-ease-in-out focus:optionbay-outline-none focus:optionbay-ring-2 focus:optionbay-ring-primary focus:optionbay-ring-offset-2
        ${currentSize.switch}
        ${checked ? "optionbay-bg-green-500" : "optionbay-bg-black"}
        ${disabled ? "optionbay-opacity-50 optionbay-cursor-not-allowed" : ""}
        ${className}
        ${classNames?.root || ""}
      `}
    >
      <span className="optionbay-sr-only">Toggle setting</span>
      <span
        aria-hidden="true"
        className={`
          optionbay-pointer-events-none optionbay-inline-block optionbay-transform optionbay-rounded-full optionbay-bg-white optionbay-shadow optionbay-ring-0 optionbay-transition optionbay-duration-200 optionbay-ease-in-out
          ${currentSize.thumb}
          ${checked ? currentSize.translate : "optionbay-translate-x-0"}
          ${classNames?.thumb || ""}
        `}
      />
    </button>
  );
};
