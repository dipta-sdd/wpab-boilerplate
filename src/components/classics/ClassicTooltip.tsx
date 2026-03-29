import { CircleQuestionMark, CircleQuestionMarkIcon } from "lucide-react";
import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";

interface ClassicTooltipProps {
  tip: string;
  className?: string;
}

/**
 * Renders the WooCommerce-native help tip icon.
 * Implements a pure React Portal tooltip instead of relying on
 * WooCommerce's bundled jQuery (tipTip) which fails on dynamically rendered React nodes.
 */
export const ClassicTooltip: React.FC<ClassicTooltipProps> = ({
  tip,
  className = "",
}) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const iconRef = useRef<HTMLSpanElement>(null);

  const updateCoords = () => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top - 8,
        left: rect.left + rect.width / 2,
      });
    }
  };
  return (
    <>
      <span
        ref={iconRef}

        onPointerEnter={(e) => {
          updateCoords();
          setVisible(true);
        }}
        onPointerLeave={(e) => {
          setVisible(false);
        }}
        onFocus={(e) => {
          updateCoords();
          setVisible(true);
        }}
        onBlur={(e) => {
          setVisible(false);
        }}
        tabIndex={0}
        className={`optionbay-cursor-help optionbay-inline-flex optionbay-items-center optionbay-justify-center optionbay-w-[16px] optionbay-h-[16px] optionbay-rounded-full optionbay-bg-[#72777c] hover:optionbay-bg-[#50575e] optionbay-text-white optionbay-transition-colors optionbay-ml-1 ${className}`}
      >
        <CircleQuestionMarkIcon />
      </span>
      {visible &&
        createPortal(
          <div
            className="optionbay-fixed optionbay-z-[999999] optionbay-bg-[#333] optionbay-text-white optionbay-px-2 optionbay-py-1 optionbay-rounded optionbay-text-xs optionbay-leading-snug optionbay-max-w-[200px] optionbay-text-center optionbay-pointer-events-none optionbay-shadow-sm"
            style={{
              top: coords.top,
              left: coords.left,
              transform: "translate(-50%, -100%)",
            }}
          >
            {tip}
            <div
              className="optionbay-absolute optionbay-border-[5px] optionbay-border-solid optionbay-border-t-[#333] optionbay-border-x-transparent optionbay-border-b-transparent"
              style={{
                top: "100%",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            />
          </div>,
          document.body,
        )}
    </>
  );
};
