import { FC } from "react";
import { useToast } from "../../store/toast/use-toast";
import { Toast } from "./Toast";

export const ToastContainer: FC = () => {
  const { toasts, removeToast } = useToast();
  return (
    <div className="optionbay-fixed optionbay-top-[10px] optionbay-right-[10px] optionbay-z-[999999] optionbay-flex optionbay-flex-col optionbay-gap-[10px] optionbay-min-w-[200px] optionbay-pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
};
