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

interface ClassicSelectProps {
  id?: string;
  value: SelectOption["value"] | null;
  onChange: (value: string | number) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
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
  const sizeClass = size === "short" ? "short" : "regular-text";
  const explicitWidth =
    size === "short" ? "250px" : size === "regular" ? "25em" : "100%";

  return (
    <div
      className={`${sizeClass} ${className}`}
      ref={containerRef}
      style={{ verticalAlign: "middle" }}
    >
      {label && (
        <label htmlFor={selectId} style={{ display: "block", marginBottom: 4 }}>
          {label}
        </label>
      )}

      <div className="wpab-relative" style={{ width: explicitWidth }}>
        {/* Trigger that looks like WP native select */}
        <div
          id={selectId}
          tabIndex={disabled ? -1 : 0}
          role="combobox"
          aria-expanded={isOpen}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleTriggerKeyDown}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: disabled ? "not-allowed" : "pointer",
            backgroundColor: disabled ? "#f0f0f1" : "#fff",
            color: disabled ? "#a7aaad" : "#2c3338",
            border: "1px solid #8c8f94",
            borderRadius: "3px",
            padding: "0 24px 0 8px",
            minHeight: "30px",
            lineHeight: "2",
            boxShadow: "0 0 0 transparent",
            transition: "box-shadow 0.1s linear",
            userSelect: "none",
            position: "relative",
            boxSizing: "border-box",
            width: "100%",
            ...(isOpen
              ? {
                  borderColor: "#2271b1",
                  boxShadow: "0 0 0 1px #2271b1",
                  outline: "2px solid transparent",
                }
              : {}),
          }}
        >
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
            }}
          >
            {selectedOption
              ? renderOption
                ? renderOption(selectedOption)
                : selectedOption.label
              : placeholder}
          </span>

          {/* Native-looking arrow */}
          <span
            style={{
              position: "absolute",
              right: 6,
              display: "flex",
              alignItems: "center",
              pointerEvents: "none",
            }}
          >
            <ChevronDown size={14} color="#50575e" />
          </span>
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            className={`wpab-absolute wpab-z-50 wpab-bg-white wpab-border wpab-border-[#8c8f94] wpab-rounded-[3px]`}
            style={{
              zIndex: 99999,
              boxShadow: "0 3px 5px rgba(0,0,0,0.2)",
              padding: 0,
              boxSizing: "border-box",
              top: "100%",
              left: "-1px",
              marginTop: "-2px",
              ...(differentDropdownWidth
                ? { minWidth: "calc(100% + 2px)" }
                : { width: "calc(100% + 2px)" }),
              border: "2px solid rgb(34, 113, 177)",
              borderTop: "none",
              borderTopLeftRadius: "0",
              borderTopRightRadius: "0",
            }}
          >
            {enableSearch && (
              <div
                style={{
                  padding: "6px",
                }}
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
                  className="focus:wpab-outline-none focus:wpab-shadow-none"
                  style={{
                    width: "100%",
                    padding: "0 8px",
                    lineHeight: "2",
                    minHeight: "26px",
                    border: "1px solid #aaaaaa",
                    outline: "none",
                    boxShadow: "none",
                    background: "#fcfcfc", // Modified background
                    borderRadius: "3px",
                    boxSizing: "border-box",
                    fontSize: "13px",
                  }}
                />
              </div>
            )}

            <ul
              ref={listRef}
              role="listbox"
              style={{
                maxHeight: "220px",
                overflowY: "auto",
                margin: 0,
                padding: "0",
                listStyle: "none",
              }}
            >
              {filteredOptions.length === 0 ? (
                <li
                  style={{
                    padding: "6px 12px",
                    color: "#646970",
                    fontStyle: "italic",
                    fontSize: "13px",
                    margin: "0",
                  }}
                >
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
                      style={{
                        padding: "6px 12px",
                        cursor: isDisabled ? "not-allowed" : "pointer",
                        backgroundColor: isHighlighted
                          ? "#2271b1"
                          : "transparent",
                        color: isHighlighted
                          ? "#fff"
                          : isDisabled
                          ? "#a7aaad"
                          : "#2c3338",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: "13px",
                        margin: "0",
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {renderOption ? renderOption(opt) : opt.label}
                      </span>

                      {/* Icons for variants */}
                      {isPro && (
                        <span
                          style={{
                            color: isHighlighted ? "#fff" : "#ffb900",
                            display: "flex",
                          }}
                        >
                          <Lock size={14} />
                        </span>
                      )}
                      {isComingSoon && (
                        <span
                          style={{
                            fontSize: "10px",
                            textTransform: "uppercase",
                            backgroundColor: isHighlighted
                              ? "rgba(255,255,255,0.2)"
                              : "#f0f0f1",
                            color: isHighlighted ? "#fff" : "#646970",
                            padding: "2px 6px",
                            borderRadius: "10px",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
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

      {description && <p className="description">{description}</p>}

      {/* Portal Tooltip or absolute Tooltip for variants */}
      {tooltipState?.visible && (
        <div
          style={{
            position: "fixed",
            top: tooltipState.top - 8,
            left: tooltipState.left,
            transform: "translate(-50%, -100%)",
            backgroundColor: "#1d2327", // WP admin dark
            color: "#fff",
            padding: "5px 10px",
            borderRadius: "3px",
            fontSize: "12px",
            pointerEvents: "none",
            zIndex: 100000,
            whiteSpace: "nowrap",
          }}
        >
          {tooltipState.text}
          {/* Tooltip caret */}
          <div
            style={{
              position: "absolute",
              bottom: "-4px",
              left: "50%",
              transform: "translateX(-50%)",
              borderWidth: "4px 4px 0",
              borderStyle: "solid",
              borderColor: "#1d2327 transparent transparent transparent",
            }}
          />
        </div>
      )}
    </div>
  );
};
