import React, {
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
  useMemo,
} from "react";
import { ChevronDown, Lock, Hourglass } from "lucide-react";
import { SelectOption } from "../common/Select";

// Hook for click outside
function useClickOutside(
  ref: React.RefObject<HTMLElement>,
  handler: (event: MouseEvent | TouchEvent) => void,
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

export interface ClassicSelectClassNames {
  container?: string;
  label?: string;
  innerContainer?: string;
  trigger?: string;
  triggerOpen?: string;
  triggerDisabled?: string;
  value?: string;
  dropdown?: string;
  searchContainer?: string;
  searchInput?: string;
  list?: string;
  option?: string;
  optionHighlighted?: string;
  optionSelected?: string;
  description?: string;
}

interface ClassicSelectProps {
  id?: string;
  value: SelectOption["value"] | null;
  onChange: (value: string | number) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  classNames?: ClassicSelectClassNames;
  label?: string;
  description?: string;
  enableSearch?: boolean;
  size?: "short" | "regular";
  renderOption?: (option: SelectOption) => React.ReactNode;
  differentDropdownWidth?: boolean;
}

export const ClassicSelect: React.FC<ClassicSelectProps> = ({
  id,
  value,
  onChange,
  options,
  placeholder = "Select an option...",
  disabled = false,
  className = "",
  classNames,
  label,
  description,
  enableSearch = false,
  size = "short",
  renderOption,
  differentDropdownWidth = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [searchQuery, setSearchQuery] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const interactionType = useRef<"mouse" | "keyboard">("keyboard");

  // Tooltip state for buy_pro
  const [tooltipState, setTooltipState] = useState<{
    visible: boolean;
    top: number;
    left: number;
    width: number;
    text: string;
  } | null>(null);
  const hoverTimeoutRef = useRef<number | null>(null);

  useClickOutside(containerRef, () => {
    setIsOpen(false);
    setTooltipState(null);
  });

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value],
  );

  const filteredOptions = useMemo(() => {
    if (!enableSearch || !searchQuery) return options;
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [options, searchQuery, enableSearch]);

  useEffect(() => {
    if (isOpen) {
      if (enableSearch && searchInputRef.current) {
        requestAnimationFrame(() => searchInputRef.current?.focus());
      }
      const selectedIndex = value
        ? filteredOptions.findIndex((opt) => opt.value === value)
        : 0;
      setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
      interactionType.current = "keyboard";
    } else {
      setSearchQuery("");
      setTooltipState(null);
    }
  }, [isOpen, value, enableSearch, filteredOptions.length]);

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

  const handleTriggerKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (isOpen && enableSearch) return;

    interactionType.current = "keyboard";
    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        if (isOpen) {
          if (filteredOptions[highlightedIndex])
            handleSelect(filteredOptions[highlightedIndex]);
        } else {
          setIsOpen(!isOpen);
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) setIsOpen(true);
        else
          setHighlightedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0,
          );
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!isOpen) setIsOpen(true);
        else
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredOptions.length - 1,
          );
        break;
      case "Escape":
        if (isOpen) {
          e.preventDefault();
          setIsOpen(false);
        }
        break;
    }
  };

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    interactionType.current = "keyboard";
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1,
        );
        break;
      case "Enter":
        e.preventDefault();
        if (filteredOptions[highlightedIndex])
          handleSelect(filteredOptions[highlightedIndex]);
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  const handleOptionHover = (
    e: React.MouseEvent<HTMLLIElement>,
    index: number,
    option: SelectOption,
  ) => {
    interactionType.current = "mouse";
    setHighlightedIndex(index);
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

    if (option.variant === "buy_pro" || option.variant === "coming_soon") {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipState({
        visible: true,
        top: rect.top,
        left: rect.left + rect.width / 2,
        width: rect.width,
        text:
          option.variant === "buy_pro"
            ? "Available in Pro Version"
            : "Coming Soon",
      });
    } else {
      setTooltipState(null);
    }
  };

  const selectId =
    id || `classic-select-${Math.random().toString(36).slice(2, 9)}`;
  const sizeClass = size === "short" ? "min-content" : "";
  const explicitWidth = size === "short" ? "min-content" : size === "regular" ? "auto" : "100%";

  return (
    <div
      className={`${sizeClass} ${className} ${classNames?.container || ""} optionbay-align-middle`.trim()}
      ref={containerRef}
    >
      {label && (
        <label
          htmlFor={selectId}
          className={`optionbay-block optionbay-mb-1 ${classNames?.label || ""}`.trim()}
        >
          {label}
        </label>
      )}

      <div className={`optionbay-relative ${classNames?.innerContainer}`} style={{ width: explicitWidth }}>
        {/* Trigger that looks like WP native select */}
        <div
          id={selectId}
          tabIndex={disabled ? -1 : 0}
          role="combobox"
          aria-expanded={isOpen}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleTriggerKeyDown}
          className={`
            optionbay-flex optionbay-items-center optionbay-justify-between 
            optionbay-appearance-none optionbay-border optionbay-border-[#8c8f94] 
            optionbay-rounded-[3px] optionbay-px-2 optionbay-pr-6 optionbay-min-h-[30px] 
            optionbay-leading-loose optionbay-transition-all optionbay-duration-100 
            optionbay-select-none optionbay-relative optionbay-box-border optionbay-w-full 
            ${
              disabled
                ? `optionbay-cursor-not-allowed optionbay-bg-[#f0f0f1] optionbay-text-[#a7aaad] ${classNames?.triggerDisabled || ""}`
                : `optionbay-cursor-pointer optionbay-bg-white optionbay-text-[#2c3338]`
            } 
            ${
              isOpen
                ? `optionbay-border-[#2271b1] optionbay-shadow-[0_0_0_1px_#2271b1] optionbay-outline-none ${classNames?.triggerOpen || ""}`
                : "optionbay-shadow-none"
            } 
            ${classNames?.trigger || ""}
          `.trim()}
        >
          <span
            className={`optionbay-overflow-hidden optionbay-text-ellipsis optionbay-whitespace-nowrap optionbay-flex-1 ${classNames?.value || ""}`.trim()}
          >
            {selectedOption
              ? renderOption
                ? renderOption(selectedOption)
                : selectedOption.label
              : placeholder}
          </span>

          {/* Native-looking arrow */}
          <span
            className="optionbay-absolute optionbay-right-1.5 optionbay-flex optionbay-items-center optionbay-pointer-events-none"
          >
            <ChevronDown size={14} color="#50575e" />
          </span>
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            className={`optionbay-absolute optionbay-z-[99999] optionbay-bg-white optionbay-border-2 optionbay-border-[#2271b1] optionbay-border-t-0 optionbay-rounded-b-[3px] optionbay-shadow-[0_3px_5px_rgba(0,0,0,0.2)] optionbay-p-0 optionbay-box-border optionbay-top-full optionbay-left-[-1px] optionbay-mt-[-2px] ${classNames?.dropdown || ""}`.trim()}
            style={{
              ...(differentDropdownWidth
                ? { minWidth: "calc(100% + 2px)" }
                : { width: "calc(100% + 2px)" }),
            }}
          >
            {enableSearch && (
              <div
                className={`optionbay-p-1.5 ${classNames?.searchContainer || ""}`.trim()}
              >
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setHighlightedIndex(0);
                  }}
                  onKeyDown={handleSearchKeyDown}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Search..."
                  className={`optionbay-w-full optionbay-px-2 optionbay-leading-loose optionbay-min-h-[26px] optionbay-border optionbay-border-[#aaaaaa] optionbay-bg-[#fcfcfc] optionbay-rounded-[3px] optionbay-box-border optionbay-text-[13px] focus:optionbay-outline-none focus:optionbay-shadow-none ${classNames?.searchInput || ""}`.trim()}
                />
              </div>
            )}

            <ul
              ref={listRef}
              role="listbox"
              className={`optionbay-max-h-[220px] optionbay-overflow-y-auto optionbay-m-0 optionbay-p-0 optionbay-list-none ${classNames?.list || ""}`.trim()}
            >
              {filteredOptions.length === 0 ? (
                <li className="optionbay-px-3 optionbay-py-1.5 optionbay-text-[#646970] optionbay-italic optionbay-text-[13px] optionbay-m-0">
                  {searchQuery ? "No results found" : "No options available"}
                </li>
              ) : (
                filteredOptions.map((opt, index) => {
                  const isSelected = selectedOption?.value === opt.value;
                  const isHighlighted = highlightedIndex === index;
                  const isPro = opt.variant === "buy_pro";
                  const isComingSoon = opt.variant === "coming_soon";
                  const isDisabled = opt.disabled || isPro || isComingSoon;

                  return (
                    <li
                      key={opt.value}
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={(e) => handleOptionHover(e, index, opt)}
                      onMouseLeave={() => {
                        hoverTimeoutRef.current = window.setTimeout(
                          () => setTooltipState(null),
                          150,
                        );
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(opt);
                      }}
                      className={`
                        optionbay-px-3 optionbay-py-1.5 optionbay-flex optionbay-items-center 
                        optionbay-justify-between optionbay-text-[13px] optionbay-m-0 
                        ${
                          isDisabled
                            ? "optionbay-cursor-not-allowed"
                            : "optionbay-cursor-pointer"
                        } 
                        ${
                          isHighlighted
                            ? `optionbay-bg-[#2271b1] optionbay-text-white ${classNames?.optionHighlighted || ""}`
                            : isDisabled
                            ? "optionbay-bg-transparent optionbay-text-[#a7aaad]"
                            : `optionbay-bg-transparent optionbay-text-[#2c3338]`
                        } 
                        ${isSelected ? classNames?.optionSelected || "" : ""}
                        ${classNames?.option || ""}
                      `.trim()}
                    >
                      <span
                        className="optionbay-flex optionbay-items-center optionbay-gap-2 optionbay-overflow-hidden optionbay-text-ellipsis optionbay-whitespace-nowrap"
                      >
                        {renderOption ? renderOption(opt) : opt.label}
                      </span>

                      {/* Icons for variants */}
                      {isPro && (
                        <span
                          className={`optionbay-flex ${isHighlighted ? "optionbay-text-white" : "optionbay-text-[#ffb900]"}`}
                        >
                          <Lock size={14} />
                        </span>
                      )}
                      {isComingSoon && (
                        <span
                          className={`optionbay-text-[10px] optionbay-uppercase optionbay-px-1.5 optionbay-py-0.5 optionbay-rounded-[10px] optionbay-font-semibold optionbay-flex optionbay-items-center optionbay-gap-1 ${isHighlighted ? "optionbay-bg-white/20 optionbay-text-white" : "optionbay-bg-[#f0f0f1] optionbay-text-[#646970]"}`}
                        >
                          <Hourglass size={10} />
                          Soon
                        </span>
                      )}
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        )}
      </div>

      {description && (
        <p className={`description optionbay-mt-1 ${classNames?.description || ""}`.trim()}>
          {description}
        </p>
      )}

      {/* Portal Tooltip or absolute Tooltip for variants */}
      {tooltipState?.visible && (
        <div
          className="optionbay-fixed optionbay-bg-[#1d2327] optionbay-text-white optionbay-px-2.5 optionbay-py-1 optionbay-rounded-[3px] optionbay-text-[12px] optionbay-pointer-events-none optionbay-z-[100000] optionbay-whitespace-nowrap"
          style={{
            top: tooltipState.top - 8,
            left: tooltipState.left,
            transform: "translate(-50%, -100%)",
          }}
        >
          {tooltipState.text}
          {/* Tooltip caret */}
          <div
            className="optionbay-absolute -optionbay-bottom-1 optionbay-left-1/2 -optionbay-translate-x-1/2 optionbay-border-x-4 optionbay-border-t-4 optionbay-border-x-transparent optionbay-border-b-transparent optionbay-border-t-[#1d2327]"
          />
        </div>
      )}
    </div>
  );
};
