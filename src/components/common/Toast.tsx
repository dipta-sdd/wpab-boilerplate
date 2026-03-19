import React, { useEffect, useState, FC } from "react";

import { Toast as ToastType } from "../../store/toast/use-toast";
import { close, Icon } from "@wordpress/icons";

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: number) => void;
}
export const Toast: FC<ToastProps> = ({ toast, onDismiss }) => {
  const [isClosing, setIsClosing] = useState<boolean>(false);

  const handleDismiss = () => {
    setIsClosing(true);
    setTimeout(() => {
      onDismiss(toast.id);
    }, 300); // 300ms animation
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, 5000); // 5 seconds
    return () => {
      clearTimeout(timer);
    };
  }, [toast.id]);
  const toastClasses = `toast toast--${toast.type} ${
    isClosing ? "toast--closing" : ""
  }`;

  return (
    <div className={toastClasses}>
      <p className="optionbay-margin-0 optionbay-text[14px] optionbay-leading-1.5 optionbay-flex-1 ">
        {toast.message}
      </p>
      <button
        className="optionbay-bg-none optionbay-border-none optionbay-text-inherit optionbay-opacity-60 hover:optionbay-opacity-100 optionbay-cursor-pointer optionbay-text[20px] optionbay-leading-1 optionbay-px[5px] optionbay-self-start optionbay-mt[-5px] optionbay-mr[-5px] optionbay-mb[-5px] optionbay-ml-0"
        onClick={handleDismiss}
        aria-label="Dismiss"
      >
        <Icon icon={close} />
      </button>
    </div>
  );
};

export default Toast;
