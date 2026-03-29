import React, {
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import apiFetch from "@wordpress/api-fetch";
import { borderClasses, hoverBorderClasses } from "./classes";

// Inline Icons to replace lucide-react
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

const X = ({ className }: { className?: string }) => (
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
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
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

export interface MultiSelectOption {
  value: string | number;
  label: string;
  className?: string;
  disabled?: boolean;
  variant?: "buy_pro" | "coming_soon";
}

export interface MultiSelectProps {
  id?: string;
  ref?: React.Ref<HTMLDivElement>;
  value: (string | number)[];
  onChange: (value: (string | number)[]) => void;
  options?: MultiSelectOption[];
  endpoint?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  label?: string | React.ReactNode;
  enableSearch?: boolean;
  isError?: boolean;
  errorClassName?: string;
  classNames?: {
    wrapper?: string;
    label?: string;
    container?: string;
    tag?: string;
    dropdown?: string;
    option?: string;
    search?: string;
    error?: string;
  };
  isCompact?: boolean;

  /**
   * Custom render function for option display.
   * Receives the option object and returns a ReactNode.
   */
  renderOption?: (option: MultiSelectOption) => React.ReactNode;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  id,
  ref,
  value = [],
  onChange,
  options = [],
  endpoint,
  placeholder = "Select options...",
  disabled = false,
  className = "",
  label,
  enableSearch = true,
  isError = false,
  errorClassName = "optionbay-border-danger",
  classNames = {},
  isCompact = false,
  renderOption,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [searchQuery, setSearchQuery] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const hoverTimeoutRef = useRef<number | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const interactionType = useRef<"mouse" | "keyboard">("keyboard");

  // Tooltip state
  const [tooltipState, setTooltipState] = useState<{
    visible: boolean;
    top: number;
    left: number;
    width: number;
    index: number;
  } | null>(null);

  // Endpoint fetching state
  const [fetchedOptions, setFetchedOptions] = useState<MultiSelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [allSeenOptions, setAllSeenOptions] = useState<MultiSelectOption[]>(
    options || [],
  );

  useEffect(() => {
    if (options && options.length > 0) {
      setAllSeenOptions((prev) => {
        const unique = new Map(prev.map((o) => [o.value, o]));
        options.forEach((o) => unique.set(o.value, o));
        return Array.from(unique.values());
      });
    }
  }, [options]);

  useEffect(() => {
    if (fetchedOptions.length > 0) {
      setAllSeenOptions((prev) => {
        const unique = new Map(prev.map((o) => [o.value, o]));
        fetchedOptions.forEach((o) => unique.set(o.value, o));
        return Array.from(unique.values());
      });
    }
  }, [fetchedOptions]);

  // Fetch from endpoint with debounce
  useEffect(() => {
    if (!endpoint) return;

    let isMounted = true;
    const delayDebounceFn = setTimeout(async () => {
      try {
        setIsLoading(true);
        const separator = endpoint.includes("?") ? "&" : "?";
        const path = `${endpoint}${separator}search=${encodeURIComponent(
          searchQuery,
        )}`;

        const response: any = await apiFetch({
          path,
          method: "GET",
        });

        if (isMounted && Array.isArray(response)) {
          const newOptions = response.map((item: any) => ({
            label: item.name,
            value: item.id,
          }));
          setFetchedOptions(newOptions);
        }
      } catch (error) {
        console.error("MultiSelect fetch error:", error);
        if (isMounted) setFetchedOptions([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(delayDebounceFn);
    };
  }, [searchQuery, endpoint]);

  // Handle outside click logic including Portal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (!isOpen) return;
      const target = event.target as Node;

      const isInsideContainer = containerRef.current?.contains(target);
      const isInsideDropdown = dropdownRef.current?.contains(target);

      if (tooltipRef.current && tooltipRef.current.contains(target)) {
        return;
      }

      if (!isInsideContainer && !isInsideDropdown) {
        setIsOpen(false);
        setTooltipState(null);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Get selected options objects
  const selectedOptions = useMemo(() => {
    const combinedOptions = endpoint ? allSeenOptions : options || [];
    return value.map((val) => {
      const found = combinedOptions.find((opt) => opt.value === val);
      return found ? found : { value: val, label: `${val}` };
    });
  }, [options, value, endpoint, allSeenOptions]);

  // Filter options based on search query (exclude already selected)
  const filteredOptions = useMemo(() => {
    const baseOptions = endpoint ? fetchedOptions : options || [];
    let filtered = baseOptions.filter((opt) => !value.includes(opt.value));

    // Process local search only if no endpoint is specified
    if (!endpoint && enableSearch && searchQuery) {
      filtered = filtered.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    return filtered;
  }, [options, value, searchQuery, enableSearch, endpoint, fetchedOptions]);

  // Reset search and highlighted index when opening/closing
  useEffect(() => {
    if (isOpen) {
      if (enableSearch && searchInputRef.current) {
        requestAnimationFrame(() => {
          searchInputRef.current?.focus();
        });
      }
      setHighlightedIndex(0);
      interactionType.current = "keyboard";
    } else {
      setSearchQuery("");
      setTooltipState(null);
    }
  }, [isOpen, enableSearch]);

  // Scroll highlighted item into view
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

  const handleSelect = (option: MultiSelectOption) => {
    if (
      option.disabled ||
      option.variant === "buy_pro" ||
      option.variant === "coming_soon"
    ) {
      return;
    }
    const newValue = [...value, option.value];
    onChange(newValue);
    setSearchQuery("");
    // Keep dropdown open for multi-select convenience
    requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
  };

  const handleRemove = (optionValue: string | number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newValue = value.filter((v) => v !== optionValue);
    onChange(newValue);
  };

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
      case "Backspace":
        if (searchQuery === "" && value.length > 0) {
          handleRemove(value[value.length - 1]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const handleTriggerClick = () => {
    if (!disabled) {
      setIsOpen(true);
      requestAnimationFrame(() => {
        searchInputRef.current?.focus();
      });
    }
  };

  const handleOptionMouseEnter = (
    e: React.MouseEvent<HTMLLIElement>,
    index: number,
    isPro: boolean,
  ) => {
    interactionType.current = "mouse";
    setHighlightedIndex(index);

    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    if (isPro) {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipState({
        visible: true,
        top: rect.top,
        left: rect.left + rect.width / 2,
        width: rect.width,
        index,
      });
    } else {
      setTooltipState(null);
    }
  };

  const handleOptionMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = window.setTimeout(() => {
      setTooltipState((prev) => (prev ? { ...prev, visible: false } : null));
    }, 100);
  };

  const handleTooltipMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setTooltipState((prev) => (prev ? { ...prev, visible: true } : null));
  };

  const handleTooltipMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setTooltipState(null);
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
          className={`optionbay-block optionbay-text-sm optionbay-font-bold optionbay-text-gray-900 optionbay-mb-2 ${
            classNames.label || ""
          }`}
        >
          {label}
        </label>
      )}

      {/* Trigger / Selected Items Container */}
      <div
        id={id}
        ref={ref}
        onClick={handleTriggerClick}
        className={`
          optionbay-relative optionbay-flex optionbay-flex-wrap optionbay-items-center optionbay-gap-2 optionbay-w-full optionbay-px-4 optionbay-text-left !optionbay-cursor-text
          optionbay-transition-all optionbay-duration-200 optionbay-ease-in-out optionbay-border optionbay-rounded-[8px] optionbay-bg-white
          ${borderClasses}
          ${isCompact ? "optionbay-py-[4px]" : "optionbay-py-[7px]"}
          ${
            disabled
              ? "optionbay-bg-gray-50 optionbay-cursor-not-allowed optionbay-text-gray-400 optionbay-border-gray-200"
              : `hover:!optionbay-border-primary`
          }
          ${isOpen ? hoverBorderClasses : ""}
          ${isError ? errorClassName : ""}
          ${classNames.container || ""}
        `}
      >
        {/* Selected Tags */}
        {selectedOptions.map((option) => (
          <span
            key={option.value}
            className={`
                optionbay-inline-flex optionbay-items-center optionbay-gap-1 optionbay-bg-gray-100 optionbay-text-gray-800 optionbay-px-2 optionbay-py-[2px] optionbay-rounded-none optionbay-text-[13px] optionbay-leading-[20px] optionbay-font-[400]
                ${classNames.tag || ""}
            `}
          >
            {option.label}
            <button
              type="button"
              onClick={(e) => handleRemove(option.value, e)}
              className="optionbay-flex optionbay-items-center optionbay-justify-center optionbay-w-4 optionbay-h-4 optionbay-rounded-full hover:optionbay-bg-gray-200 optionbay-transition-colors optionbay-text-gray-500"
              aria-label={`Remove ${option.label}`}
            >
              <X className="optionbay-w-3 optionbay-h-3" />
            </button>
          </span>
        ))}

        {/* Search Input */}
        <input
          ref={searchInputRef}
          type="text"
          className={`
            optionbay-flex-1 optionbay-min-w-[80px] optionbay-bg-transparent !optionbay-border-none !optionbay-shadow-none optionbay-outline-none optionbay-px-1 optionbay-py-[2px]  !optionbay-text-[13px] !optionbay-leading-[20px] optionbay-font-[400] optionbay-text-gray-900 optionbay-placeholder-gray-400 !optionbay-min-h-[24px]
            ${classNames.search || ""}
          `}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setHighlightedIndex(0);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleSearchKeyDown}
          placeholder={selectedOptions.length === 0 ? placeholder : ""}
          disabled={disabled}
        />

        {/* Chevron Icon */}
        <span className="optionbay-flex-shrink-0 optionbay-ml-auto optionbay-flex optionbay-items-center">
          <ChevronDown
            className={`optionbay-h-4 optionbay-w-4 optionbay-text-gray-500 optionbay-transition-transform optionbay-duration-200 ${
              isOpen ? "optionbay-transform optionbay-rotate-180" : ""
            }`}
          />
        </span>
      </div>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={`
                optionbay-absolute optionbay-z-[50000] optionbay-w-full optionbay-bg-white optionbay-border optionbay-border-gray-200 optionbay-rounded-[12px] optionbay-p-[4px] optionbay-shadow-[0_4px_12px_rgba(0,0,0,0.1)] optionbay-top-full optionbay-left-0 -optionbay-mt-[1px]
                ${classNames.dropdown || ""}
            `}
        >
          <ul
            ref={listRef}
            role="listbox"
            tabIndex={-1}
            className="optionbay-max-h-[204px] optionbay-overflow-auto focus:optionbay-outline-none"
            style={{ scrollbarWidth: "none" }}
          >
            {isLoading ? (
              <li className="optionbay-px-3 optionbay-py-2 optionbay-text-gray-500 optionbay-text-sm optionbay-text-center optionbay-italic !optionbay-mb-0 optionbay-rounded-[8px]">
                Loading...
              </li>
            ) : filteredOptions.length === 0 ? (
              <li className="optionbay-px-3 optionbay-py-2 optionbay-text-gray-500 optionbay-text-sm optionbay-text-center optionbay-italic !optionbay-mb-0 optionbay-rounded-[8px]">
                {searchQuery ? "No results found" : "No more options"}
              </li>
            ) : (
              filteredOptions.map((option, index) => {
                const isHighlighted = highlightedIndex === index;
                const isDisabled = option.disabled;
                const isPro = option.variant === "buy_pro";
                const isComingSoon = option.variant === "coming_soon";

                return (
                  <li
                    key={`${option.value}-${index}`}
                    role="option"
                    aria-selected={false}
                    onMouseEnter={(e) => {
                      handleOptionMouseEnter(e, index, !!isPro);
                    }}
                    onMouseLeave={handleOptionMouseLeave}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(option);
                    }}
                    className={`
                        optionbay-group optionbay-relative optionbay-cursor-pointer optionbay-select-none optionbay-px-4 optionbay-py-2.5 optionbay-text-sm optionbay-transition-colors optionbay-border-b optionbay-border-gray-50 last:optionbay-border-0 !optionbay-mb-0 optionbay-rounded-[8px]
                        optionbay-flex optionbay-flex-nowrap optionbay-justify-between optionbay-items-center
                        ${
                          isDisabled || isPro || isComingSoon
                            ? "optionbay-opacity-100 !optionbay-cursor-not-allowed optionbay-text-gray-500 optionbay-bg-gray-100/50"
                            : ""
                        }
                        ${
                          isHighlighted &&
                          !isDisabled &&
                          !isPro &&
                          !isComingSoon
                            ? "optionbay-bg-blue-600 optionbay-text-white"
                            : "optionbay-text-gray-700"
                        }
                        ${
                          isComingSoon
                            ? "hover:!optionbay-text-pink-600 !optionbay-text-pink-500"
                            : ""
                        }
                        ${option.className || ""}
                        ${classNames.option || ""}
                        `}
                  >
                    <div className="optionbay-flex optionbay-items-center optionbay-min-w-0 optionbay-gap-4">
                      <span className="optionbay-block optionbay-truncate">
                        {renderOption ? renderOption(option) : option.label}
                      </span>
                    </div>

                    {/* Lock Icon for Buy Pro */}
                    {isPro && (
                      <LockKeyhole className="optionbay-w-3.5 optionbay-h-3.5 optionbay-text-[#f02a74] optionbay-flex-shrink-0" />
                    )}
                    {isComingSoon && (
                      <span className="optionbay-bg-pink-600 optionbay-text-white optionbay-p-1 optionbay-px-2 optionbay-rounded-full optionbay-text-xs optionbay-flex optionbay-items-center optionbay-gap-1 optionbay-flex-nowrap optionbay-flex-shrink-0">
                        <Hourglass className="optionbay-w-3.5 optionbay-h-3.5 optionbay-text-white" />
                        <span className="optionbay-whitespace-nowrap">
                          Coming Soon
                        </span>
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
              top: tooltipState.top + 5,
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

export default MultiSelect;
