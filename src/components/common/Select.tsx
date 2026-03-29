import React, {
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import { useClickOutside } from "./hooks/useClickOutside";
import {
  borderClasses,
  errorClasses,
  errorClassesManual,
  hoverBorderClasses,
  hoverClassesManual,
} from "./classes";

// SVGs replacement for lucide-react
const ChevronDown = ({ className }: { className?: string }) => (
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
    <path d="m6 9 6 6 6-6" />
  </svg>
);

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

export interface SelectOption {
  value: string | number;
  label: string;
  /**
   * Optional custom classes for this specific option.
   * Useful for multi-color dropdowns (e.g., badges, status colors).
   */
  className?: string;
  disabled?: boolean;
  /**
   * Special variants for the option.
   * 'buy_pro' will disable the option and show a tooltip.
   */
  variant?: "buy_pro" | "coming_soon";
}

export interface SelectProps {
  id?: string;
  /**
   * The current selected value(s)
   */
  value: SelectOption["value"] | null;
  /**
   * Callback when an option is selected
   */
  onChange: (value: string | number) => void;
  /**
   * List of available options
   */
  options: SelectOption[];
  /**
   * Placeholder text when no value is selected
   */
  placeholder?: string;

  /**
   * Font size for the select options
   */
  fontSize?: number;

  /**
   * Font weight for the select options
   */
  fontWeight?: number;
  /**
   * Disable the entire interaction
   */
  disabled?: boolean;
  /**
   * Custom class for the container
   */
  className?: string;
  /**
   * Helper text or label (optional)
   */
  label?: string;

  /**
   * Enable search functionality within the dropdown
   */
  enableSearch?: boolean;
  /**
   * Reference to the container element
   */
  con_ref?: React.Ref<HTMLDivElement>;
  /**
   * Custom border class
   */
  border?: string;
  /**
   * Custom hover border class
   */
  hoverBorder?: string;
  /**
   * Custom text color class
   */
  color?: string;

  isError?: boolean;

  errorClassName?: string;

  differentDropdownWidth?: boolean;

  hideIcon?: boolean;

  isCompact?: boolean;

  classNames?: {
    wrapper?: string;
    container?: string;
    label?: string;
    select?: string;
    option?: string;
    dropdown?: string;
    search?: string;
    error?: string;
  };

  /**
   * Custom render function for option display.
   * Receives the option object and returns a ReactNode.
   * Used for both the selected display and the dropdown list.
   */
  renderOption?: (option: SelectOption) => React.ReactNode;
}

const Select: React.FC<SelectProps> = ({
  id,
  value,
  con_ref,
  onChange,
  options,
  placeholder = "Select an option...",
  disabled = false,
  className = "",
  fontSize = 13,
  fontWeight = 500,
  label,
  enableSearch = false,
  border = borderClasses,
  hoverBorder = hoverBorderClasses,
  color = "optionbay-text-[#0a4b78]",
  isError = false,
  errorClassName = errorClasses,
  differentDropdownWidth = false,
  hideIcon = false,
  isCompact = false,
  classNames = {} as NonNullable<SelectProps["classNames"]>,
  renderOption,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [searchQuery, setSearchQuery] = useState("");

  // Tooltip state
  const [tooltipState, setTooltipState] = useState<{
    visible: boolean;
    top: number;
    left: number;
    width: number;
    index: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const hoverTimeoutRef = useRef<number | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Track interaction type to prevent auto-scrolling on mouse hover
  const interactionType = useRef<"mouse" | "keyboard">("keyboard");

  // Close dropdown when clicking outside
  useClickOutside(containerRef, (event) => {
    if (
      tooltipRef.current &&
      tooltipRef.current.contains(event.target as Node)
    ) {
      return;
    }
    setIsOpen(false);
    setTooltipState(null);
  });

  const selectedOption = useMemo(() => {
    return options.find((option) => option.value === value);
  }, [options, value]);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!enableSearch || !searchQuery) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [options, searchQuery, enableSearch]);

  // Reset search and highlighted index when opening/closing
  useEffect(() => {
    if (isOpen) {
      if (enableSearch && searchInputRef.current) {
        // Wait for render, then focus
        requestAnimationFrame(() => {
          searchInputRef.current?.focus();
        });
      }

      // Highlight the currently selected item in the filtered list if present
      const selectedIndex = value
        ? filteredOptions.findIndex((opt) => opt.value === value)
        : 0;
      const initialIndex = selectedIndex >= 0 ? selectedIndex : 0;
      setHighlightedIndex(initialIndex);

      // Ensure we allow scrolling to the initial selection
      interactionType.current = "keyboard";
    } else {
      // Clear search when closed
      setSearchQuery("");
      setTooltipState(null);
    }
  }, [isOpen, value, enableSearch, filteredOptions.length]);

  // Scroll highlighted item into view (Only if interaction was keyboard or initial open)
  useEffect(() => {
    if (
      isOpen &&
      listRef.current &&
      highlightedIndex >= 0 &&
      interactionType.current === "keyboard"
    ) {
      const list = listRef.current;
      const element = list.children[highlightedIndex] as HTMLElement;
      if (element) {
        const listTop = list.scrollTop;
        const listBottom = listTop + list.clientHeight;
        const elementTop = element.offsetTop;
        const elementBottom = elementTop + element.offsetHeight;

        if (elementTop < listTop) {
          list.scrollTop = elementTop;
        } else if (elementBottom > listBottom) {
          list.scrollTop = elementBottom - list.clientHeight;
        }
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (option: SelectOption) => {
    if (
      option.disabled ||
      option.variant === "buy_pro" ||
      option.variant === "coming_soon"
    )
      return;
    onChange(option.value);
    setIsOpen(false);
    setSearchQuery("");
    setTooltipState(null);
  };

  // Keyboard handler for the Main Trigger Div
  const handleTriggerKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    // If search is enabled and open, the input handles keys, not this div
    // But if closed, or if search is disabled, this handles keys.
    if (isOpen && enableSearch) return;

    interactionType.current = "keyboard";

    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        if (isOpen) {
          if (filteredOptions[highlightedIndex]) {
            handleSelect(filteredOptions[highlightedIndex]);
          }
        } else {
          setIsOpen((prev) => !prev);
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          // Navigation when open but search disabled
          setHighlightedIndex((prev) => {
            const next = prev < filteredOptions.length - 1 ? prev + 1 : 0;
            return next;
          });
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          // Navigation when open but search disabled
          setHighlightedIndex((prev) => {
            const next = prev > 0 ? prev - 1 : filteredOptions.length - 1;
            return next;
          });
        }
        break;
      case "Tab":
        setIsOpen(false);
        break;
      case "Escape":
        if (isOpen) {
          e.preventDefault();
          setIsOpen(false);
        }
        break;
      default:
        break;
    }
  };

  // Keyboard handler for the Search Input
  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    interactionType.current = "keyboard";
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => {
          const next = prev < filteredOptions.length - 1 ? prev + 1 : 0;
          return next;
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => {
          const next = prev > 0 ? prev - 1 : filteredOptions.length - 1;
          return next;
        });
        break;
      case "Enter":
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        // Return focus to the trigger
        if (containerRef.current) {
          const trigger = containerRef.current.querySelector(
            '[role="combobox"]',
          ) as HTMLElement;
          trigger?.focus();
        }
        break;
      default:
        break;
    }
  };

  // Handle showing tooltip with delay logic
  const handleOptionMouseEnter = (
    e: React.MouseEvent<HTMLLIElement>,
    index: number,
    isPro: boolean,
  ) => {
    interactionType.current = "mouse";
    setHighlightedIndex(index);

    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    if (isPro) {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipState({
        visible: true,
        top: rect.top,
        left: rect.left + rect.width / 2,
        width: rect.width,
        index: index,
      });
    } else {
      // If moving to a non-pro item, close tooltip immediately
      setTooltipState(null);
    }
  };

  const handleOptionMouseLeave = () => {
    // Delay hiding tooltip to allow moving mouse into the tooltip itself
    hoverTimeoutRef.current = window.setTimeout(() => {
      setTooltipState(null);
    }, 150);
  };

  const handleTooltipMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handleTooltipMouseLeave = () => {
    hoverTimeoutRef.current = window.setTimeout(() => {
      setTooltipState(null);
    }, 150);
  };
  return (
    <div
      className={`optionbay-relative optionbay-w-full ${className} ${
        classNames.wrapper || ""
      }`}
      ref={containerRef}
    >
      {label && (
        <label
          className={`optionbay-block optionbay-text-sm optionbay-font-medium optionbay-text-gray-700 optionbay-mb-1 ${
            classNames.label || ""
          }`}
        >
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <div
        id={id}
        ref={con_ref}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls="custom-select-list"
        aria-disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleTriggerKeyDown}
        className={`
          optionbay-ring-1 optionbay-ring-transparent
          optionbay-relative optionbay-flex optionbay-flex-wrap  optionbay-items-center optionbay-justify-between optionbay-w-full optionbay-gap-0 optionbay-px-4  optionbay-text-left !optionbay-cursor-pointer 
          optionbay-transition-all optionbay-duration-200 optionbay-ease-in-out optionbay-border optionbay-rounded-[8px] optionbay-bg-white ${border} 
          ${isCompact ? "optionbay-py-[5px]" : "optionbay-py-[9px]"}
          ${!disabled && !isOpen ? ` ${color} ` : ""}
          ${
            disabled
              ? "optionbay-bg-gray-100 optionbay-cursor-not-allowed optionbay-text-gray-400 optionbay-border-gray-200"
              : isError
              ? ""
              : "hover:!optionbay-border-[#3858e9]"
          }
          ${isOpen ? (isError ? errorClassesManual : hoverClassesManual) : ""}
          ${isError ? `${errorClassName} ${classNames.error || ""}` : ""}
          ${classNames.select || ""} ${classNames.container || ""}
        `}
      >
        <div className="optionbay-flex-1 optionbay-min-w-0">
          {enableSearch && isOpen ? (
            <input
              ref={searchInputRef}
              type="text"
              className={`optionbay-w-full !optionbay-bg-transparent !optionbay-border-none !optionbay-shadow-none !optionbay-outline-none !optionbay-p-0 !optionbay-font-[${fontWeight}] !optionbay-text-[${fontSize}px] !optionbay-leading-[20px] !optionbay-min-h-[unset] ${
                classNames.search || ""
              }`}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setHighlightedIndex(0); // Reset highlight on search
              }}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking input
              onKeyDown={handleSearchKeyDown}
              placeholder="Search..."
            />
          ) : (
            <span
              className={`optionbay-block optionbay-truncate ${color} hover:!optionbay-text-[#3858e9] optionbay-text-[${fontSize}px] optionbay-font-[${fontWeight}]`}
            >
              {value ? (
                <span
                  className={`optionbay-flex optionbay-items-center optionbay-gap-2 `}
                >
                  {renderOption && selectedOption
                    ? renderOption(selectedOption)
                    : selectedOption?.label}
                </span>
              ) : (
                placeholder
              )}
            </span>
          )}
        </div>

        {/* Chevron Icon */}
        {!hideIcon ? (
          <span className="optionbay-flex-shrink-0 optionbay-ml-2 optionbay-flex optionbay-items-center">
            <ChevronDown
              className={`optionbay-h-4 optionbay-w-4 optionbay-text-gray-700 optionbay-transition-transform optionbay-duration-200 ${
                isOpen ? "optionbay-transform optionbay-rotate-180" : ""
              }`}
            />
          </span>
        ) : null}
      </div>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className={`optionbay-absolute optionbay-z-[50000] optionbay-bg-white optionbay-border optionbay-border-gray-200 optionbay-rounded-[12px] optionbay-shadow-[0_2px_2px_rgba(0,0,0,0.3)] -optionbay-mt-[1px] optionbay-p-1 ${
            differentDropdownWidth ? "" : "optionbay-w-full"
          } ${classNames.dropdown || ""}`}
        >
          {/* Options List */}
          <ul
            ref={listRef}
            id="custom-select-list"
            role="listbox"
            tabIndex={-1}
            onScroll={() => setTooltipState(null)} // Hide tooltip on scroll to prevent detachment
            className={`optionbay-max-h-60 optionbay-overflow-auto focus:optionbay-outline-none optionbay-scrollbar-hide optionbay-relative ${color} optionbay-font-[${fontWeight}] optionbay-text-[${fontSize}px]`}
            style={{ scrollbarWidth: "none" }}
          >
            {filteredOptions.length === 0 ? (
              <li className="optionbay-relative optionbay-cursor-default optionbay-select-none optionbay-p-1  optionbay-italic optionbay-text-center optionbay-rounded-[8px]">
                {searchQuery ? "No results found" : "No options available"}
              </li>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = selectedOption?.value === option.value;
                // Highlight if matched index OR if it's the item keeping the tooltip open
                const isHighlighted =
                  highlightedIndex === index ||
                  (tooltipState?.visible && tooltipState.index === index);
                const isPro = option.variant === "buy_pro";
                const isComingSoon = option.variant === "coming_soon";
                const isDisabled = option.disabled || isPro;

                return (
                  <li
                    key={`${option.value}-${index}`}
                    id={`option-${index}`}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={(e) =>
                      handleOptionMouseEnter(e, index, !!isPro)
                    }
                    onMouseLeave={handleOptionMouseLeave}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(option);
                    }}
                    className={`
                      optionbay-group optionbay-relative optionbay-cursor-pointer optionbay-select-none optionbay-px-3  optionbay-flex optionbay-flex-nowrap optionbay-justify-between optionbay-min-h-[36px]optionbay-font-medium optionbay-transition-colors optionbay-duration-150 !optionbay-mb-0 optionbay-border-b-[1px] optionbay-border-gray-100  optionbay-rounded-[8px] 
                      ${
                        isDisabled
                          ? "optionbay-opacity-100 !optionbay-cursor-not-allowed optionbay-text-gray-500 optionbay-bg-gray-200"
                          : ""
                      }
                      ${
                        isComingSoon
                          ? "optionbay-opacity-100 !optionbay-cursor-not-allowed !optionbay-text-pink-500 hover:!optionbay-text-pink-600 optionbay-bg-gray-200"
                          : ""
                      }
                      ${
                        isHighlighted && !isDisabled
                          ? "optionbay-bg-blue-600 optionbay-text-white"
                          : isDisabled
                          ? "optionbay-text-gray-400"
                          : ""
                      }
                      ${
                        !isHighlighted && !isDisabled
                          ? option.className || ""
                          : ""
                      }
                      ${classNames.option || ""}
                    `}
                  >
                    <div className="optionbay-flex optionbay-items-center optionbay-justify-between optionbay-min-h-[36px] optionbay-w-full optionbay-gap-4">
                      <span
                        className={`optionbay-block optionbay-truncate ${
                          isSelected
                            ? "optionbay-font-semibold"
                            : "optionbay-font-normal"
                        }`}
                      >
                        {renderOption ? renderOption(option) : option.label}
                      </span>

                      {/* Lock Icon for Buy Pro */}
                      {isPro && (
                        <LockKeyhole className="optionbay-w-3.5 optionbay-h-3.5 optionbay-text-[#f02a74]" />
                      )}
                      {isComingSoon && (
                        <span className="optionbay-bg-pink-600 optionbay-text-white optionbay-p-1 optionbay-px-2 optionbay-rounded-full optionbay-text-xs optionbay-flex optionbay-items-center optionbay-gap-1 optionbay-flex-nowrap">
                          <Hourglass className="optionbay-w-3.5 optionbay-h-3.5 optionbay-text-white" />
                          <span className="optionbay-whitespace-nowrap">
                            Coming Soon
                          </span>
                        </span>
                      )}
                    </div>

                    {/* Checkmark for selected item */}
                    {isSelected && !isPro && !isComingSoon && (
                      <span
                        className={`optionbay-px-3 optionbay-pr-0 optionbay-flex-nowrap optionbay-flex optionbay-items-center optionbay-pr-4 ${
                          isHighlighted && !isDisabled
                            ? "optionbay-text-white"
                            : "optionbay-text-blue-600"
                        }`}
                      >
                        <svg
                          className="optionbay-h-5 optionbay-w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}

      {/* Tooltip Portal - Renders to body to avoid clipping and stacking issues */}
      {isOpen &&
        tooltipState?.visible &&
        createPortal(
          <div
            ref={tooltipRef}
            className="optionbay-fixed optionbay-z-[50001] optionbay-flex optionbay-flex-col optionbay-items-center optionbay-gap-1.5 optionbay-bg-gray-900 optionbay-text-white optionbay-text-xs optionbay-p-2 optionbay-min-w-[140px] optionbay-rounded-md optionbay-shadow-lg"
            style={{
              top: tooltipState.top + 5, // Adjusted to user preference
              left: tooltipState.left,
              transform: "translate(-50%, -100%)",
            }}
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
          >
            <span className="optionbay-font-medium optionbay-whitespace-nowrap">
              Upgrade to unlock
            </span>
            <a
              href="#"
              target="_blank"
              onClick={(e) => e.preventDefault()}
              className="optionbay-w-full optionbay-bg-[#f02a74] hover:!optionbay-bg-[#e71161] optionbay-text-white hover:!optionbay-text-white optionbay-font-bold optionbay-py-1.5 optionbay-px-3 optionbay-transition-colors focus:optionbay-outline-none focus:optionbay-ring-0 optionbay-cursor-pointer optionbay-text-center optionbay-rounded"
            >
              Buy Pro
            </a>
            {/* Tooltip Arrow */}
            <div className="optionbay-absolute optionbay-top-full optionbay-left-1/2 -optionbay-translate-x-1/2 optionbay-border-4 optionbay-border-transparent optionbay-border-t-gray-900"></div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default Select;
