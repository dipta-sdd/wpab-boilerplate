import React from "react";

interface ClassicCheckboxProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  description?: string;
  className?: string;
  id?: string;
}

export const ClassicCheckbox: React.FC<ClassicCheckboxProps> = ({
  label,
  checked,
  onChange,
  disabled,
  description,
  className = "",
  id,
}) => {
  const checkboxId = id || `classic-cb-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <>
      <label htmlFor={checkboxId} className={className}>
        <input
          id={checkboxId}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        {label && <> {label}</>}
      </label>
      {description && <span className="description">{description}</span>}
    </>
  );
};
