import React from "react";

export interface ListItem {
  label: string;
  value: string;
}

interface ListSelectProps {
  items: ListItem[];
  selectedValues: string[];
  onChange: (value: string) => void;
  className?: string;
  size?: "small" | "medium" | "large";
  classNames?: {
    root?: string;
    item?: string;
    iconWrapper?: string;
    icon?: string;
    label?: string;
  };
}

export const ListSelect: React.FC<ListSelectProps> = ({
  items,
  selectedValues,
  onChange,
  className = "",
  size = "medium",
  classNames,
}) => {
  const sizeStyles = {
    small: {
      item: "optionbay-px-3 optionbay-py-2",
      label: "optionbay-text-xs",
      iconWrapper: "optionbay-w-4",
      icon: "optionbay-w-3 optionbay-h-3",
    },
    medium: {
      item: "optionbay-px-4 optionbay-py-3",
      label: "optionbay-text-sm",
      iconWrapper: "optionbay-w-5",
      icon: "optionbay-w-4 optionbay-h-4",
    },
    large: {
      item: "optionbay-px-5 optionbay-py-4",
      label: "optionbay-text-base",
      iconWrapper: "optionbay-w-6",
      icon: "optionbay-w-5 optionbay-h-5",
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <div
      className={`optionbay-flex optionbay-flex-col optionbay-border optionbay-border-default optionbay-rounded-lg optionbay-bg-white optionbay-overflow-hidden ${className} ${
        classNames?.root || ""
      }`}
    >
      {items.map((item, index) => {
        const isSelected = selectedValues.includes(item.value);
        return (
          <div
            key={item.value}
            onClick={() => onChange(item.value)}
            className={`
              optionbay-flex optionbay-items-center optionbay-gap-3 
              optionbay-cursor-pointer optionbay-transition-colors
              hover:optionbay-bg-gray-50
              ${currentSize.item}
              ${
                index !== items.length - 1
                  ? "optionbay-border-b optionbay-border-gray-100"
                  : ""
              }
              ${classNames?.item || ""}
            `}
          >
            <div
              className={`optionbay-flex optionbay-justify-center ${
                currentSize.iconWrapper
              } ${classNames?.iconWrapper || ""}`}
            >
              {isSelected && (
                <svg
                  className={`optionbay-text-gray-900 ${currentSize.icon} ${
                    classNames?.icon || ""
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
            </div>
            <span
              className={`${currentSize.label} ${
                isSelected
                  ? "optionbay-text-gray-900 optionbay-font-medium"
                  : "optionbay-text-gray-500"
              } ${classNames?.label || ""}`}
            >
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
