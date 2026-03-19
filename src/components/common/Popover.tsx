import React, { useState, useRef, useEffect } from "react";

export type PopoverAlign =
  | "top"
  | "top-left"
  | "top-right"
  | "bottom"
  | "bottom-left"
  | "bottom-right"
  | "left"
  | "right";

interface PopoverProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  align?: PopoverAlign;
  className?: string;
  classNames?: {
    root?: string;
    triggerWrapper?: string;
    content?: string;
  };
}

export const Popover: React.FC<PopoverProps> = ({
  trigger,
  content,
  align = "bottom-left",
  className = "",
  classNames,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggle = () => setIsOpen(!isOpen);

  // Position & Origin Logic
  let positionClasses = "";
  let originClass = "";

  switch (align) {
    case "top":
      positionClasses =
        "optionbay-bottom-full optionbay-mb-2 optionbay-left-1/2 optionbay--translate-x-1/2";
      originClass = "optionbay-origin-bottom";
      break;
    case "top-left":
      positionClasses = "optionbay-bottom-full optionbay-mb-2 optionbay-left-0";
      originClass = "optionbay-origin-bottom-left";
      break;
    case "top-right":
      positionClasses =
        "optionbay-bottom-full optionbay-mb-2 optionbay-right-0";
      originClass = "optionbay-origin-bottom-right";
      break;
    case "bottom":
      positionClasses =
        "optionbay-top-full optionbay-mt-2 optionbay-left-1/2 optionbay--translate-x-1/2";
      originClass = "optionbay-origin-top";
      break;
    case "bottom-left":
      positionClasses = "optionbay-top-full optionbay-mt-2 optionbay-left-0";
      originClass = "optionbay-origin-top-left";
      break;
    case "bottom-right":
      positionClasses = "optionbay-top-full optionbay-mt-2 optionbay-right-0";
      originClass = "optionbay-origin-top-right";
      break;
    case "left":
      positionClasses =
        "optionbay-right-full optionbay-mr-2 optionbay-top-1/2 optionbay--translate-y-1/2";
      originClass = "optionbay-origin-right";
      break;
    case "right":
      positionClasses =
        "optionbay-left-full optionbay-ml-2 optionbay-top-1/2 optionbay--translate-y-1/2";
      originClass = "optionbay-origin-left";
      break;
    default:
      positionClasses = "optionbay-top-full optionbay-mt-2 optionbay-left-0";
      originClass = "optionbay-origin-top-left";
  }

  // Transition classes (Opacity + Scale)
  const transitionClasses = isOpen
    ? "optionbay-opacity-100 optionbay-scale-100 optionbay-pointer-events-auto"
    : "optionbay-opacity-0 optionbay-scale-95 optionbay-pointer-events-none";

  return (
    <div
      ref={containerRef}
      className={`optionbay-relative optionbay-inline-block ${className} ${
        classNames?.root || ""
      }`}
    >
      {/* Trigger Wrapper */}
      <div
        onClick={toggle}
        className={`optionbay-cursor-pointer optionbay-inline-flex ${
          classNames?.triggerWrapper || ""
        }`}
      >
        {trigger}
      </div>

      {/* Dropdown Content */}
      <div
        className={`
          optionbay-absolute optionbay-z-50 optionbay-w-48
          optionbay-bg-white optionbay-rounded-xl optionbay-shadow-xl optionbay-border optionbay-border-default
          optionbay-transition-all optionbay-duration-200 optionbay-ease-out
          ${positionClasses}
          ${originClass}
          ${transitionClasses}
          ${classNames?.content || ""}
        `}
      >
        {content}
      </div>
    </div>
  );
};
