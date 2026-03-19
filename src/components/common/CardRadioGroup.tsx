import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { SelectionCard } from "./SelectionCard";

export interface CardOption {
  value: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  variant?: "buy_pro" | "coming_soon";
}

interface CardRadioGroupProps {
  options: CardOption[];
  value: string;
  onChange: (value: string) => void;
  layout?: "vertical" | "horizontal" | "responsive";
  className?: string;
  classNames?: {
    root?: string;
    card?: {
      root?: string;
      iconWrapper?: string;
      circle?: string;
      dot?: string;
      textWrapper?: string;
      title?: string;
      description?: string;
    };
  };
}

export const CardRadioGroup: React.FC<CardRadioGroupProps> = ({
  options,
  value,
  onChange,
  layout = "responsive",
  className = "",
  classNames,
}) => {
  let containerClass = "";

  switch (layout) {
    case "vertical":
      containerClass = "optionbay-flex optionbay-flex-col optionbay-gap-4";
      break;
    case "horizontal":
      containerClass =
        "optionbay-flex optionbay-flex-row optionbay-gap-4 optionbay-overflow-x-auto optionbay-pb-2"; // Added overflow handling for safe horizontal scrolling if needed
      break;
    case "responsive":
    default:
      containerClass =
        "optionbay-grid optionbay-grid-cols-1 md:!optionbay-grid-cols-2 optionbay-gap-4";
      break;
  }

  // Tooltip State
  const [tooltipState, setTooltipState] = useState<{
    visible: boolean;
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const hoverTimeoutRef = useRef<number | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleCardMouseEnter = (
    e: React.MouseEvent<HTMLDivElement>,
    isPro: boolean,
  ) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    if (isPro) {
      const rect = e.currentTarget.getBoundingClientRect();
      // Calculate center position
      const centerX = rect.left + rect.width / 2;
      // Position above the card
      const topY = rect.top;

      setTooltipState({
        visible: true,
        top: topY,
        left: centerX,
        width: rect.width,
      });
    } else {
      setTooltipState(null);
    }
  };

  const handleCardMouseLeave = () => {
    hoverTimeoutRef.current = window.setTimeout(() => {
      setTooltipState(null);
    }, 150);
  };

  const handleTooltipMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handleTooltipMouseLeave = () => {
    hoverTimeoutRef.current = window.setTimeout(() => {
      setTooltipState(null);
    }, 150);
  };

  return (
    <>
      <div
        className={`${containerClass} ${className} ${classNames?.root || ""}`}
      >
        {options.map((option) => (
          <SelectionCard
            key={option.value}
            title={option.title}
            description={option.description}
            selected={value === option.value}
            onClick={() => onChange(option.value)}
            icon={option.icon}
            disabled={option.disabled}
            variant={option.variant}
            onMouseEnter={(e) =>
              handleCardMouseEnter(e, option.variant === "buy_pro")
            }
            onMouseLeave={handleCardMouseLeave}
            classNames={classNames?.card}
          />
        ))}
      </div>

      {/* Tooltip Portal */}
      {tooltipState?.visible &&
        createPortal(
          <div
            ref={tooltipRef}
            className="optionbay-fixed optionbay-z-[50001] optionbay-flex optionbay-flex-col optionbay-items-center optionbay-gap-1.5 optionbay-bg-gray-900 optionbay-text-white optionbay-text-xs optionbay-p-2 optionbay-min-w-[140px] optionbay-rounded-md optionbay-shadow-lg"
            style={{
              top: tooltipState.top - 10, // Slight offset upwards from the card top
              left: tooltipState.left,
              transform: "translate(-50%, -100%)",
            }}
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
          >
            <span className="optionbay-font-medium optionbay-whitespace-nowrap">
              Upgrade to unlock
            </span>
            <a
              href="#"
              target="_blank"
              onClick={(e) => e.preventDefault()}
              className="optionbay-w-full optionbay-bg-[#f02a74] hover:!optionbay-bg-[#e71161] optionbay-text-white hover:!optionbay-text-white optionbay-font-bold optionbay-py-1.5 optionbay-px-3 optionbay-transition-colors focus:optionbay-outline-none focus:optionbay-ring-0 optionbay-cursor-pointer optionbay-text-center optionbay-rounded"
            >
              Buy Pro
            </a>
            {/* Tooltip Arrow */}
            <div className="optionbay-absolute optionbay-top-full optionbay-left-1/2 -optionbay-translate-x-1/2 optionbay-border-4 optionbay-border-transparent optionbay-border-t-gray-900"></div>
          </div>,
          document.body,
        )}
    </>
  );
};
