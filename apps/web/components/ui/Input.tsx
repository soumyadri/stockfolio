import { useId, type InputHTMLAttributes } from "react";
import { authFieldClassName, fieldClassName } from "./fieldStyles";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  variant?: "default" | "auth";
}

function slugifyLabel(label: string): string {
  return label.toLowerCase().replace(/\s+/g, "-");
}

export function Input({ label, id, variant = "auth", className = "", ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? (label ? `${generatedId}-${slugifyLabel(label)}` : generatedId);
  const styles = variant === "auth" ? authFieldClassName : fieldClassName;

  const input = (
    <input id={inputId} className={`${styles} ${className}`} {...props} />
  );

  if (!label) return input;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-slate-200">
        {label}
      </label>
      {input}
    </div>
  );
}
