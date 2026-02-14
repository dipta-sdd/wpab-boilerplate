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
      <p className="wpab-margin-0 wpab-text[14px] wpab-leading-1.5 wpab-flex-1 ">
        {toast.message}
      </p>
      <button
        className="wpab-bg-none wpab-border-none wpab-text-inherit wpab-opacity-60 hover:wpab-opacity-100 wpab-cursor-pointer wpab-text[20px] wpab-leading-1 wpab-px[5px] wpab-self-start wpab-mt[-5px] wpab-mr[-5px] wpab-mb[-5px] wpab-ml-0"
        onClick={handleDismiss}
        aria-label="Dismiss"
      >
        <Icon icon={close} />
      </button>
    </div>
  );
};

export default Toast;
