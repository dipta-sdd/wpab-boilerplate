import React from "react";

export const FormError = ({ message }: { message?: string }) => {
  if (!message) return null;
  return (
    <div className="optionbay-text-[#d63638] optionbay-text-xs optionbay-mt-1">
      {message}
    </div>
  );
};
