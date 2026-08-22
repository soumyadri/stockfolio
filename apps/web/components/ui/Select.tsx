import type { SelectHTMLAttributes } from "react";
import { fieldClassName } from "./fieldStyles";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  label?: string;
}

export function Select({ options, label, id, className = "", ...props }: SelectProps) {
  const selectId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  const select = (
    <div className="relative">
      <select
        id={selectId}
        className={`${fieldClassName} appearance-none pr-8 ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
        ▾
      </span>
    </div>
  );

  if (!label) return select;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className="text-sm font-medium text-slate-200">
        {label}
      </label>
      {select}
    </div>
  );
}
