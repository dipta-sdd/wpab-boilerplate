import React, { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
  closeOnOutsideClick?: boolean;
  className?: string;
  showHeader?: boolean;
  classNames?: {
    header?: string;
    body?: string;
    footer?: string;
  };
}

const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = "optionbay-max-w-2xl",
  closeOnOutsideClick = true,
  className = "",
  showHeader = true,
  classNames = {
    header: "",
    body: "",
    footer: "",
  },
}) => {
  // Handle Escape key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      // Prevent scrolling on body when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="optionbay-fixed optionbay-inset-0 optionbay-z-[9998] optionbay-flex optionbay-items-center optionbay-justify-center optionbay-p-4 optionbay-bg-black/75 optionbay-transition-opacity optionbay-duration-300">
      {/* Backdrop click handler */}
      <div
        className="optionbay-absolute optionbay-inset-0"
        onClick={closeOnOutsideClick ? onClose : undefined}
      />

      {/* Modal Content */}
      <div
        className={`
          optionbay-relative optionbay-w-full ${maxWidth} 
          optionbay-bg-white optionbay-shadow-2xl optionbay-rounded-xl 
          optionbay-flex optionbay-flex-col optionbay-max-h-[90vh]
          optionbay-animate-in optionbay-fade-in optionbay-zoom-in-95 optionbay-duration-200
          ${className}
        `}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        {showHeader && (
          <div
            className={`optionbay-flex optionbay-items-center optionbay-justify-between optionbay-px-6 optionbay-py-4 optionbay-border-b optionbay-border-gray-100 ${classNames.header}`}
          >
            <h3 className="optionbay-text-lg optionbay-font-semibold optionbay-text-gray-900">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="optionbay-p-1.5 optionbay-text-gray-400 hover:optionbay-text-gray-600 optionbay-transition-colors hover:optionbay-bg-gray-100 optionbay-rounded-full"
              aria-label="Close modal"
            >
              <X className="optionbay-w-5 optionbay-h-5" />
            </button>
          </div>
        )}

        {/* Body */}
        <div
          className={`optionbay-p-6 optionbay-overflow-y-auto optionbay-flex-1 ${classNames.body}`}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className={`optionbay-flex optionbay-items-center optionbay-justify-end optionbay-gap-3 optionbay-px-6 optionbay-py-4 optionbay-bg-gray-50 optionbay-border-t optionbay-border-gray-100 optionbay-rounded-b-xl ${classNames.footer}`}
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default CustomModal;
