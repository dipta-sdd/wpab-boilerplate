import React, { useState, useRef, ReactNode } from "react";
import { createPortal } from "react-dom";
import { LockKeyhole } from "lucide-react";
import { __ } from "@wordpress/i18n";
import { useWpabStore } from "../../store/wpabStore";

interface BuyProTooltipProps {
  children: ReactNode;
  className?: string;
}

export const BuyProTooltip: React.FC<BuyProTooltipProps> = ({
  children,
  className = "",
}) => {
  const store = useWpabStore();
  const [tooltipState, setTooltipState] = useState<{
    visible: boolean;
    top: number;
    left: number;
  } | null>(null);

  const hoverTimeoutRef = useRef<number | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipState({
      visible: true,
      top: rect.top,
      left: rect.left + rect.width / 2,
    });
  };

  const handleMouseLeave = () => {
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
        className={`optionbay-relative optionbay-inline-block ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
        <div className="optionbay-absolute optionbay-right-2 optionbay-top-1/2 -optionbay-translate-y-1/2 optionbay-pointer-events-none">
          <LockKeyhole className="optionbay-w-3.5 optionbay-h-3.5 optionbay-text-[#f02a74]" />
        </div>
      </div>
      {tooltipState?.visible &&
        createPortal(
          <div
            ref={tooltipRef}
            className="optionbay-fixed optionbay-z-[50001] optionbay-flex optionbay-flex-col optionbay-items-center optionbay-gap-1.5 optionbay-bg-gray-900 optionbay-text-white optionbay-text-xs optionbay-p-2 optionbay-min-w-[140px]"
            style={{
              top: tooltipState.top + 5, // Adjusted to user preference
              left: tooltipState.left,
              transform: "translate(-50%, -100%)",
            }}
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
          >
            <span className="optionbay-font-medium optionbay-whitespace-nowrap">
              {__("Upgrade to unlock", "optionbay")}
            </span>
            <a
              href={store.pluginData?.support_uri || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="optionbay-w-full optionbay-bg-[#f02a74] hover:!optionbay-bg-[#e71161] optionbay-text-white hover:!optionbay-text-white optionbay-font-bold optionbay-py-1.5 optionbay-px-3 optionbay-transition-colors focus:optionbay-outline-none focus:optionbay-ring-0 optionbay-cursor-pointer optionbay-text-center optionbay-no-underline"
            >
              {__("Buy Pro", "optionbay")}
            </a>
            {/* Tooltip Arrow */}
            <div className="optionbay-absolute optionbay-top-full optionbay-left-1/2 -optionbay-translate-x-1/2 optionbay-border-4 optionbay-border-transparent optionbay-border-t-gray-900"></div>
          </div>,
          document.body,
        )}
    </>
  );
};
