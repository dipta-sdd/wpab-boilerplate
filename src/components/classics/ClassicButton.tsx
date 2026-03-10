import React from "react";

interface ClassicButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "link" | "link-delete" | "action";
  className?: string;
}

export const ClassicButton: React.FC<ClassicButtonProps> = ({
  children,
  variant = "primary",
  className = "",
  ...props
}) => {
  const variantClass = {
    primary: "button button-primary",
    secondary: "button button-secondary",
    link: "button-link",
    "link-delete": "button-link button-link-delete",
    action: "button wc-action-button",
  }[variant];

  return (
    <button className={`${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
};
