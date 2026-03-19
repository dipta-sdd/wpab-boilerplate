import React from "react";

// Icons
const LockKeyhole = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="16" r="1" />
    <rect x="3" y="10" width="18" height="12" rx="2" />
    <path d="M7 10V7a5 5 0 0 1 10 0v3" />
  </svg>
);

const Hourglass = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 22h14" />
    <path d="M5 2h14" />
    <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
    <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
  </svg>
);

interface SelectionCardProps {
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  variant?: "buy_pro" | "coming_soon";
  onMouseEnter?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLDivElement>) => void;
  classNames?: {
    root?: string;
    iconWrapper?: string;
    circle?: string;
    dot?: string;
    textWrapper?: string;
    title?: string;
    description?: string;
  };
}

export const SelectionCard: React.FC<SelectionCardProps> = ({
  title,
  description,
  selected,
  onClick,
  icon,
  disabled,
  variant,
  onMouseEnter,
  onMouseLeave,
  classNames,
}) => {
  const isPro = variant === "buy_pro";
  const isComingSoon = variant === "coming_soon";
  const isDisabled = disabled || isPro || isComingSoon;

  return (
    <div
      onClick={() => !isDisabled && onClick()}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`
        optionbay-relative optionbay-p-[20px] optionbay-rounded-[8px] optionbay-transition-all optionbay-duration-200
        optionbay-flex optionbay-items-start optionbay-gap-[10px]
        ${
          isDisabled
            ? "optionbay-bg-gray-50 optionbay-border optionbay-border-gray-200 optionbay-cursor-not-allowed"
            : "optionbay-cursor-pointer"
        }
        ${
          !isDisabled && selected
            ? "optionbay-bg-primary optionbay-border optionbay-border-primary optionbay-shadow-sm optionbay-shadow-primary/20"
            : !isDisabled
            ? "optionbay-bg-white optionbay-border optionbay-border-gray-100 hover:optionbay-border-gray-300"
            : ""
        }
        ${classNames?.root || ""}
      `}
    >
      {/* Badges */}
      {isPro && (
        <div
          className="optionbay-absolute optionbay-top-3 optionbay-right-3"
          title="Upgrade to Pro"
        >
          <LockKeyhole className="optionbay-w-5 optionbay-h-5 optionbay-text-[#f02a74]" />
        </div>
      )}
      {isComingSoon && (
        <div className="optionbay-absolute optionbay-top-3 optionbay-right-3">
          <span className="optionbay-bg-pink-100 optionbay-text-pink-600 optionbay-px-2 optionbay-py-0.5 optionbay-rounded-full optionbay-text-[10px] optionbay-font-bold optionbay-uppercase optionbay-flex optionbay-items-center optionbay-gap-1">
            <Hourglass className="optionbay-w-3 optionbay-h-3" />
            Soon
          </span>
        </div>
      )}

      <div className={`optionbay-mt-1 ${classNames?.iconWrapper || ""}`}>
        <div
          className={`
            optionbay-w-5 optionbay-h-5 optionbay-rounded-full optionbay-border-2 optionbay-flex optionbay-items-center optionbay-justify-center
            ${
              isDisabled
                ? "optionbay-border-gray-300 optionbay-bg-gray-100"
                : ""
            }
            ${
              !isDisabled && selected
                ? "optionbay-border-white"
                : !isDisabled
                ? "optionbay-border-gray-300"
                : ""
            }
            ${classNames?.circle || ""}
        `}
        >
          {!isDisabled && selected && (
            <div
              className={`optionbay-w-2.5 optionbay-h-2.5 optionbay-bg-white optionbay-rounded-full ${
                classNames?.dot || ""
              }`}
            />
          )}
        </div>
      </div>
      <div className={classNames?.textWrapper || ""}>
        <h3
          className={`optionbay-text-[15px] optionbay-leading-[24px] optionbay-font-[700] optionbay-mb-1 ${
            !isDisabled && selected
              ? "optionbay-text-white"
              : "optionbay-text-gray-900"
          } ${isDisabled ? "!optionbay-text-gray-400" : ""} ${
            classNames?.title || ""
          }`}
        >
          {title}
        </h3>
        <p
          className={`optionbay-text-[13px] optionbay-leading-[20px] ${
            !isDisabled && selected
              ? "optionbay-text-blue-100"
              : "optionbay-text-gray-500"
          } ${isDisabled ? "!optionbay-text-gray-400" : ""} ${
            classNames?.description || ""
          }`}
        >
          {description}
        </p>
      </div>
    </div>
  );
};
