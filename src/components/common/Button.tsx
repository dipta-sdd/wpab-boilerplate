import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  size?: "small" | "medium" | "large";
  color?: "primary" | "secondary" | "danger";
  variant?: "solid" | "outline" | "ghost";
}

const Button = ({
  children,
  className = "",
  size = "medium",
  color = "primary",
  variant = "solid",
  ...props
}: ButtonProps) => {
  const sizeClasses = {
    small: "optionbay-px-[8px] optionbay-py-[5px]",
    medium: "optionbay-px-[12px] optionbay-py-[6px]",
    large: "optionbay-px-[16px] optionbay-py-[10px]",
  };

  const colorClasses = {
    primary: {
      solid:
        "optionbay-bg-primary optionbay-text-white optionbay-border optionbay-border-primary hover:optionbay-bg-primary-hovered hover:optionbay-border-primary-hovered",
      outline:
        "optionbay-bg-transparent optionbay-border optionbay-border-primary optionbay-text-primary hover:optionbay-bg-primary hover:optionbay-text-white",
      ghost:
        "optionbay-bg-transparent optionbay-text-primary hover:optionbay-text-primary-hovered hover:optionbay-bg-primary/10",
    },
    secondary: {
      solid:
        "optionbay-bg-secondary optionbay-text-white optionbay-border optionbay-border-secondary hover:optionbay-bg-secondary-hovered",
      outline:
        "optionbay-bg-transparent optionbay-border optionbay-border-secondary optionbay-text-secondary hover:optionbay-bg-secondary hover:optionbay-text-white",
      ghost:
        "optionbay-bg-transparent optionbay-text-[#1e1e1e] hover:!optionbay-text-primary",
    },
    danger: {
      solid:
        "optionbay-bg-red-500 optionbay-text-white optionbay-border optionbay-border-red-500 hover:optionbay-bg-red-600 hover:optionbay-border-red-600",
      outline:
        "optionbay-bg-transparent optionbay-border optionbay-border-red-500 optionbay-text-red-500 hover:optionbay-bg-red-500 hover:optionbay-text-white",
      ghost:
        "optionbay-bg-transparent optionbay-text-red-500 hover:optionbay-bg-red-500/10",
    },
  };

  // Safely access nested properties
  const variantClasses =
    colorClasses[color]?.[variant] ?? colorClasses.primary.solid;
  const finalSizeClass = sizeClasses[size] ?? sizeClasses.medium;

  return (
    <button
      className={`
                optionbay-flex optionbay-items-center optionbay-justify-center optionbay-gap-[6px]
                optionbay-text-default optionbay-rounded-[8px] optionbay-transition-all optionbay-duration-200
                disabled:optionbay-opacity-50 disabled:optionbay-cursor-not-allowed
                ${finalSizeClass} 
                ${variantClasses} 
                ${className}
            `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
