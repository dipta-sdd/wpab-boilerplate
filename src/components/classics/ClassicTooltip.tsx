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
        className={`wpab-inline-flex wpab-items-center wpab-justify-center wpab-w-[16px] wpab-h-[16px] wpab-rounded-full wpab-bg-[#72777c] hover:wpab-bg-[#50575e] wpab-text-white wpab-transition-colors wpab-ml-1 ${className}`}
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
        style={{ cursor: "help" }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="wpab-w-3 wpab-h-3"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      </span>
      {visible &&
        createPortal(
          <div
            style={{
              position: "fixed",
              zIndex: 999999,
              top: coords.top,
              left: coords.left,
              transform: "translate(-50%, -100%)",
              backgroundColor: "#333",
              color: "#fff",
              padding: "5px 8px",
              borderRadius: "3px",
              fontSize: "12px",
              lineHeight: "1.4",
              maxWidth: "200px",
              textAlign: "center",
              pointerEvents: "none",
              boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
            }}
          >
            {tip}
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                borderWidth: "5px",
                borderStyle: "solid",
                borderColor: "#333 transparent transparent transparent",
              }}
            />
          </div>,
          document.body
        )}
    </>
  );
};
