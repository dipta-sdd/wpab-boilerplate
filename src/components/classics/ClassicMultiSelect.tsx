import React, { useState, useRef, useEffect, KeyboardEvent, useMemo } from "react";
import { ChevronDown, X, Lock, Hourglass } from "lucide-react";
import { MultiSelectOption } from "../common/MultiSelect";
import apiFetch from "@wordpress/api-fetch";

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

interface ClassicMultiSelectProps {
  id?: string;
  value: (string | number)[];
  onChange: (value: (string | number)[]) => void;
  options?: MultiSelectOption[];
  endpoint?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  label?: string | React.ReactNode;
  enableSearch?: boolean;
  size?: "short" | "regular";
  renderOption?: (option: MultiSelectOption) => React.ReactNode;
  description?: string;
}

export const ClassicMultiSelect: React.FC<ClassicMultiSelectProps> = ({
  id,
  value,
  onChange,
  options = [],
  endpoint,
  placeholder = "Select options...",
  disabled = false,
  className = "",
  label,
  enableSearch = true,
  size = "short",
  renderOption,
  description,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [searchQuery, setSearchQuery] = useState("");
  const [apiOptions, setApiOptions] = useState<MultiSelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const interactionType = useRef<"mouse" | "keyboard">("keyboard");

  const [tooltipState, setTooltipState] = useState<{
    visible: boolean;
    top: number;
    left: number;
    text: string;
  } | null>(null);
  const hoverTimeoutRef = useRef<number | null>(null);

  useClickOutside(containerRef, () => {
    setIsOpen(false);
    setSearchQuery("");
    setTooltipState(null);
  });

  const effectiveOptions = endpoint ? apiOptions : options;

  useEffect(() => {
    let active = true;
    if (endpoint) {
      if (!isOpen) return; // Only fetch when opened
      setIsLoading(true);
      const url = new URL(
        endpoint.startsWith("http") ? endpoint : `${window.location.origin}/wp-json${endpoint}`
      );
      if (searchQuery) url.searchParams.append("search", searchQuery);

      apiFetch({ path: url.pathname + url.search })
        .then((res: any) => {
          if (active) {
            setApiOptions(res?.data || res || []);
            setIsLoading(false);
          }
        })
        .catch(() => {
          if (active) setIsLoading(false);
        });
    }
    return () => { active = false; };
  }, [endpoint, searchQuery, isOpen]);

  const filteredOptions = useMemo(() => {
    if (endpoint) return effectiveOptions;
    if (!enableSearch || !searchQuery) return effectiveOptions;
    return effectiveOptions.filter((opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [effectiveOptions, searchQuery, enableSearch, endpoint]);

  // Selected values
  const selectedOptions = useMemo(() => {
    return effectiveOptions.filter((opt) => value.includes(opt.value));
  }, [effectiveOptions, value]);

  useEffect(() => {
    if (isOpen) {
      if (enableSearch && searchInputRef.current) {
        requestAnimationFrame(() => searchInputRef.current?.focus());
      }
      setHighlightedIndex(0);
      interactionType.current = "keyboard";
    } else {
      setSearchQuery("");
      setTooltipState(null);
    }
  }, [isOpen, enableSearch, filteredOptions.length]);

  useEffect(() => {
    if (isOpen && listRef.current && highlightedIndex >= 0 && interactionType.current === "keyboard") {
      const list = listRef.current;
      const element = list.children[highlightedIndex] as HTMLElement;
      if (element) {
        const listTop = list.scrollTop;
        const listBottom = listTop + list.clientHeight;
        const elementTop = element.offsetTop;
        const elementBottom = elementTop + element.offsetHeight;
        if (elementTop < listTop) list.scrollTop = elementTop;
        else if (elementBottom > listBottom) list.scrollTop = elementBottom - list.clientHeight;
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (option: MultiSelectOption) => {
    // @ts-ignore - sharing variant types from Select for consistency
    const variant = option.variant;
    if (option.disabled || variant === "buy_pro" || variant === "coming_soon") return;

    if (value.includes(option.value)) {
      onChange(value.filter((v) => v !== option.value));
    } else {
      onChange([...value, option.value]);
    }
    
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleRemove = (e: React.MouseEvent, valToRemove: string | number) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== valToRemove));
  };

  const handleTriggerKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (isOpen && enableSearch) return;

    interactionType.current = "keyboard";
    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        setIsOpen(!isOpen);
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) setIsOpen(true);
        else setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!isOpen) setIsOpen(true);
        else setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
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
        setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) handleSelect(filteredOptions[highlightedIndex]);
        break;
      case "Backspace":
        if (!searchQuery && value.length > 0) {
          onChange(value.slice(0, -1));
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  const selectId = id || `classic-multi-${Math.random().toString(36).slice(2, 9)}`;
  const sizeClass = size === "short" ? "short" : "regular-text";

  return (
    <div className={`campaignbay-relative ${className}`} ref={containerRef}>
      {label && <label htmlFor={selectId} style={{ display: "block", marginBottom: 4 }}>{label}</label>}

      <div
        id={selectId}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleTriggerKeyDown}
        className={`${sizeClass}`}
        style={{
          display: "inline-flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "4px",
          cursor: disabled ? "not-allowed" : "text",
          backgroundColor: disabled ? "#f0f0f1" : "#fff",
          border: "1px solid #8c8f94",
          borderRadius: "3px",
          padding: "3px 24px 3px 6px",
          minHeight: "30px",
          transition: "box-shadow 0.1s linear",
          position: "relative",
          boxSizing: "border-box",
          ...(isOpen ? { borderColor: "#2271b1", boxShadow: "0 0 0 1px #2271b1", outline: "2px solid transparent" } : {}),
        }}
      >
        {selectedOptions.map((opt) => (
          <span
            key={opt.value}
            style={{
              backgroundColor: "#f0f0f1",
              border: "1px solid #c3c4c7",
              borderRadius: "3px",
              padding: "0 4px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "12px",
              color: "#3c434a",
              lineHeight: "20px"
            }}
          >
            {opt.label}
            <button
              onClick={(e) => handleRemove(e, opt.value)}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                color: "#8c8f94",
                display: "flex",
                alignItems: "center"
              }}
            >
              <X size={12} />
            </button>
          </span>
        ))}

        {/* Search input embedded in the trigger */}
        {enableSearch && (
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onKeyDown={handleSearchKeyDown}
            placeholder={value.length === 0 ? placeholder : ""}
            disabled={disabled}
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              minWidth: "50px",
              flex: 1,
              padding: 0,
              fontSize: "13px",
              boxShadow: "none",
            }}
          />
        )}

        {!enableSearch && value.length === 0 && (
          <span style={{ color: "#8c8f94", fontSize: "13px", paddingLeft: "4px" }}>{placeholder}</span>
        )}

        {/* Chevron icon pointing down */}
        <span style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", display: "flex", pointerEvents: "none" }}>
          <ChevronDown size={14} color="#50575e" />
        </span>
      </div>

      {description && <p className="description" style={{ marginTop: 2 }}>{description}</p>}

      {isOpen && (
        <div
          className={`campaignbay-absolute campaignbay-z-50 campaignbay-bg-white campaignbay-border campaignbay-border-[#8c8f94] campaignbay-rounded-[3px] campaignbay-mt-1 ${sizeClass}`}
          style={{
            zIndex: 99999,
            boxShadow: "0 3px 5px rgba(0,0,0,0.2)",
            padding: 0,
            boxSizing: "border-box",
            minWidth: "100%",
          }}
        >
          {isLoading ? (
            <div style={{ padding: "8px 12px", color: "#646970", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Hourglass size={14} className="campaignbay-animate-spin" /> Loading...
            </div>
          ) : (
            <ul
              ref={listRef}
              role="listbox"
              style={{
                maxHeight: "220px",
                overflowY: "auto",
                margin: 0,
                padding: "4px 0",
                listStyle: "none",
              }}
            >
              {filteredOptions.length === 0 ? (
                <li style={{ padding: "6px 12px", color: "#646970", fontStyle: "italic", fontSize: "13px" }}>
                  {searchQuery ? "No results found" : "No options available"}
                </li>
              ) : (
                filteredOptions.map((opt, index) => {
                  const isSelected = value.includes(opt.value);
                  const isHighlighted = highlightedIndex === index;
                  // @ts-ignore
                  const variant = opt.variant;
                  const isPro = variant === "buy_pro";
                  const isComingSoon = variant === "coming_soon";
                  const isDisabled = opt.disabled || isPro || isComingSoon;

                  return (
                    <li
                      key={opt.value}
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={(e) => {
                        interactionType.current = "mouse";
                        setHighlightedIndex(index);
                        if (isPro || isComingSoon) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltipState({
                            visible: true,
                            top: rect.top,
                            left: rect.left + rect.width / 2,
                            text: isPro ? "Available in Pro" : "Coming Soon",
                          });
                        } else {
                          setTooltipState(null);
                        }
                      }}
                      onMouseLeave={() => setTooltipState(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(opt);
                      }}
                      style={{
                        padding: "6px 12px",
                        cursor: isDisabled ? "not-allowed" : "pointer",
                        backgroundColor: isHighlighted ? "#2271b1" : "transparent",
                        color: isHighlighted ? "#fff" : isDisabled ? "#a7aaad" : "#2c3338",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: "13px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          style={{
                            pointerEvents: "none",
                            margin: 0,
                            borderRadius: "2px",
                            border: `1px solid ${isHighlighted ? "#fff" : "#8c8f94"}`,
                            width: "14px",
                            height: "14px",
                          }}
                        />
                        <span>{renderOption ? renderOption(opt) : opt.label}</span>
                      </div>

                      {/* Icons for variants */}
                      {isPro && (
                        <span style={{ color: isHighlighted ? "#fff" : "#ffb900", display: "flex" }}>
                          <Lock size={14} />
                        </span>
                      )}
                      {isComingSoon && (
                        <span
                          style={{
                            fontSize: "10px",
                            textTransform: "uppercase",
                            backgroundColor: isHighlighted ? "rgba(255,255,255,0.2)" : "#f0f0f1",
                            color: isHighlighted ? "#fff" : "#646970",
                            padding: "2px 6px",
                            borderRadius: "10px",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
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
          )}
        </div>
      )}

      {tooltipState?.visible && (
        <div
          style={{
            position: "fixed",
            top: tooltipState.top - 8,
            left: tooltipState.left,
            transform: "translate(-50%, -100%)",
            backgroundColor: "#1d2327",
            color: "#fff",
            padding: "5px 10px",
            borderRadius: "3px",
            fontSize: "12px",
            pointerEvents: "none",
            zIndex: 100000,
            whiteSpace: "nowrap"
          }}
        >
          {tooltipState.text}
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
