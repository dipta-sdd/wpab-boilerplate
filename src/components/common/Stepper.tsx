import React, { Dispatch, SetStateAction } from "react";

interface StepperProps {
  steps: string[];
  currentStep: number;
  setStep: (step: number) => void | Dispatch<SetStateAction<number>>;
  classNames?: {
    root?: string;
    container?: string;
    backgroundLine?: string;
    progressLine?: string;
    stepContainer?: string;
    stepCircle?: string;
    stepLabel?: string;
  };
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  setStep,
  classNames,
}) => {
  // Calculate width percentage for the green progress line
  // Total segments = steps.length - 1
  // If currentStep is 1, progress is 0%
  // If currentStep is 2, progress covers the first segment
  const progressPercentage = Math.max(
    0,
    Math.min(100, ((currentStep - 1) / (steps.length - 1)) * 100),
  );

  return (
    <div
      className={`optionbay-w-full optionbay-py-6 ${classNames?.root || ""}`}
    >
      <div
        className={`optionbay-flex optionbay-justify-between optionbay-items-start optionbay-relative ${
          classNames?.container || ""
        }`}
      >
        {/* Background Grey Line */}
        {/* Positioned with left-16 and right-16 (4rem) to start/end at the center of the first/last circles (w-32 items) */}
        <div
          className={`optionbay-absolute optionbay-top-5 optionbay-left-16 optionbay-right-16 optionbay-h-[2px] optionbay-bg-gray-200 optionbay-z-0 ${
            classNames?.backgroundLine || ""
          }`}
        >
          {/* Foreground Green Line */}
          <div
            className={`optionbay-h-full optionbay-bg-green-500 optionbay-transition-all optionbay-duration-500 optionbay-ease-out ${
              classNames?.progressLine || ""
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {steps.map((step, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;

          return (
            <div
              key={step}
              className={`optionbay-flex optionbay-flex-col optionbay-items-center optionbay-relative optionbay-z-10 optionbay-w-32  ${
                classNames?.stepContainer || ""
              }`}
            >
              <div
                onClick={isCompleted ? () => setStep(stepNum) : undefined}
                className={`
                  optionbay-w-10 optionbay-h-10 optionbay-rounded-full optionbay-flex optionbay-items-center optionbay-justify-center
                  optionbay-transition-colors optionbay-duration-300 optionbay-border-2
                  ${
                    isCompleted
                      ? "optionbay-cursor-pointer"
                      : "optionbay-cursor-not-allowed"
                  }
                  ${
                    isCompleted || isActive
                      ? "optionbay-bg-green-500 optionbay-border-green-500 optionbay-text-white"
                      : "optionbay-bg-gray-300 optionbay-border-gray-300 optionbay-text-white"
                  }
                  ${classNames?.stepCircle || ""}
                `}
              >
                {isCompleted ? (
                  <svg
                    className="optionbay-w-6 optionbay-h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <span className="optionbay-text-sm optionbay-font-bold">
                    {stepNum.toString().padStart(2, "0")}
                  </span>
                )}
              </div>
              <div
                className={`optionbay-mt-3 optionbay-text-xs optionbay-font-bold optionbay-text-center optionbay-transition-colors ${
                  isActive || isCompleted
                    ? "optionbay-text-gray-900"
                    : "optionbay-text-gray-500"
                } ${classNames?.stepLabel || ""}`}
              >
                {step}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
