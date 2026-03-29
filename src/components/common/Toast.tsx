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

  const getToastTypeClasses = () => {
    switch (toast.type) {
      case "success":
        return "optionbay-bg-[#f0fff4] optionbay-border-l-[#228b22] optionbay-text-[#1a472a]";
      case "error":
        return "optionbay-bg-[#fff5f5] optionbay-border-l-[#cc0000] optionbay-text-[#5c2121]";
      case "info":
      default:
        return "optionbay-bg-white optionbay-border-l-[#2271b1] optionbay-text-[#1d2327]";
    }
  };

  const toastClasses = `
    optionbay-relative optionbay-p-5 optionbay-rounded-[4px] optionbay-shadow-[0_4px_12px_rgba(0,0,0,0.15)] 
    optionbay-flex optionbay-items-center optionbay-justify-between optionbay-gap-[15px] 
    optionbay-border-l-[5px] optionbay-backdrop-blur-[3px]
    ${isClosing ? "optionbay-animate-slide-out" : "optionbay-animate-slide-in"}
    ${getToastTypeClasses()}
  `;

  return (
    <div className={toastClasses}>
      <p className="optionbay-m-0 optionbay-text-[14px] optionbay-leading-[1.5] optionbay-flex-1 ">
        {toast.message}
      </p>
      <button
        className="optionbay-bg-none optionbay-border-none optionbay-text-inherit optionbay-opacity-60 hover:optionbay-opacity-100 optionbay-cursor-pointer optionbay-text-[20px] optionbay-leading-none optionbay-px-[5px] optionbay-self-start -optionbay-mt-[5px] -optionbay-mr-[5px] -optionbay-mb-[5px] optionbay-ml-0"
        onClick={handleDismiss}
        aria-label="Dismiss"
      >
        <Icon icon={close} />
      </button>
    </div>
  );
};

export default Toast;
