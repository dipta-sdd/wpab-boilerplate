import React from "react";
import Button from "./Button";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  classNames?: {
    overlay?: string;
    content?: string;
    title?: string;
    message?: string;
    footer?: string;
    button?: {
      cancelClassName?: string;
      confirmClassName?: string;
      cancelVariant?: "solid" | "outline" | "ghost";
      confirmVariant?: "solid" | "outline" | "ghost";
      cancelColor?: "primary" | "secondary" | "danger";
      confirmColor?: "primary" | "secondary" | "danger";
    };
  };
}
export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  classNames = {},
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={`optionbay-fixed optionbay-inset-0 optionbay-z-[60000] optionbay-flex optionbay-items-center optionbay-justify-center optionbay-bg-black/50 optionbay-backdrop-blur-sm optionbay-transition-opacity ${
        classNames.overlay || ""
      }`}
    >
      <div
        className={`optionbay-bg-white optionbay-rounded-lg optionbay-shadow-xl optionbay-pt-6 optionbay-pb-3 optionbay-px-8 optionbay-max-w-sm optionbay-w-full optionbay-mx-4 optionbay-transform optionbay-transition-all optionbay-scale-100 ${
          classNames.content || ""
        }`}
      >
        <h3
          className={`optionbay-text-lg optionbay-font-bold optionbay-text-gray-900 optionbay-mb-2 optionbay-text-nowrap ${
            classNames.title || ""
          }`}
        >
          {title}
        </h3>
        <p
          className={`optionbay-text-gray-600 optionbay-mb-6 optionbay-text-sm optionbay-leading-relaxed ${
            classNames.message || ""
          }`}
        >
          {message}
        </p>
        <div
          className={`optionbay-flex optionbay-justify-end optionbay-gap-3 ${
            classNames.footer || ""
          }`}
        >
          <Button
            className={classNames.button?.cancelClassName || ""}
            variant={classNames.button?.cancelVariant || "ghost"}
            color={classNames.button?.cancelColor || "secondary"}
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            className={classNames.button?.confirmClassName || ""}
            variant={classNames.button?.confirmVariant || "solid"}
            color={classNames.button?.confirmColor || "primary"}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
