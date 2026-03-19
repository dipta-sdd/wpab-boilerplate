import { check, edit, Icon } from "@wordpress/icons";
import React, { useState, useRef, useEffect } from "react";

interface EditableTextProps {
  value: string | null | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  classNames?: {
    root?: string;
    text?: string;
    input?: string;
    iconButton?: string;
    icon?: string;
  };
  error?: string | undefined;
}

export const EditableText: React.FC<EditableTextProps> = ({
  value,
  onChange,
  placeholder = "Click to edit...",
  className = "",
  disabled = false,
  classNames,
  error,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync local state when prop value changes
  useEffect(() => {
    setLocalValue(value ?? "");
  }, [value]);

  const handleSave = () => {
    if (localValue !== (value ?? "")) {
      onChange(localValue);
    }
    setIsEditing(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setLocalValue(value ?? "");
      setIsEditing(false);
      inputRef.current?.blur();
    }
  };

  const onFocus = () => {
    if (!disabled) {
      setIsEditing(true);
    }
  };

  const onBlur = () => {
    // Trigger save on blur
    handleSave();
  };

  return (
    <div>
      <div
        className={`optionbay-flex optionbay-items-center optionbay-gap-2 ${className} ${
          classNames?.root || ""
        }`}
      >
        <input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          readOnly={disabled}
          placeholder={placeholder}
          className={`
          !optionbay-bg-transparent !optionbay-shadow-none
          optionbay-text-[#1e1e1e] optionbay-font-[700] optionbay-text-[20px] optionbay-leading-[32px]
          optionbay-px-1 optionbay-py-0.5
          optionbay-w-auto 
          !optionbay-border-t-0 !optionbay-border-l-0 !optionbay-border-r-0 !optionbay-border-b-2
           !optionbay-rounded-[0px]
          focus:optionbay-outline-none
          optionbay-transition-colors optionbay-duration-200 placeholder:optionbay-italic
          ${
            error
              ? "!optionbay-border-red-500"
              : "!optionbay-border-transparent focus:!optionbay-border-[#3858e9]"
          }
          ${isEditing ? "" : "optionbay-cursor-pointer"}
          ${disabled ? "optionbay-cursor-not-allowed optionbay-opacity-60" : ""}
          ${isEditing ? classNames?.input || "" : classNames?.text || ""}
        `}
        />

        {!disabled && (
          <button
            type="button"
            // Prevent blur on mousedown so click event fires properly
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.stopPropagation();
              if (isEditing) {
                handleSave();
              } else {
                inputRef.current?.focus();
              }
            }}
            className={`
            optionbay-p-1 optionbay-rounded-full optionbay-transition-colors
            ${
              isEditing
                ? "optionbay-text-primary hover:optionbay-bg-blue-50"
                : "optionbay-text-gray-400 hover:optionbay-text-primary hover:optionbay-bg-gray-100"
            }
            ${classNames?.iconButton || ""}
          `}
            aria-label={isEditing ? "Save" : "Edit"}
          >
            {isEditing ? (
              <Icon icon={check} fill="currentColor" />
            ) : (
              <Icon icon={edit} fill="currentColor" />
            )}
          </button>
        )}
      </div>
      {error && (
        <span className="optionbay-text-red-500 optionbay-text-sm optionbay-mt-1">
          {error}
        </span>
      )}
    </div>
  );
};
