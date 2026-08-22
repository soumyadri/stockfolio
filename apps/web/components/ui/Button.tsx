import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "outline" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700",
  outline: "border border-[#3a3a3a] text-slate-200 hover:bg-[#1a1a1a]",
  ghost: "text-slate-300 hover:bg-[#1a1a1a] hover:text-white",
};

export function Button({
  variant = "primary",
  fullWidth = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 sm:px-4 sm:py-2 sm:text-sm ${variantClasses[variant]} ${fullWidth ? "w-full py-3" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
