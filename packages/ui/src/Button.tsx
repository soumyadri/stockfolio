import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function Button({ children, className, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={className}
      style={{
        padding: "8px 16px",
        borderRadius: "6px",
        border: "none",
        backgroundColor: "#2563eb",
        color: "white",
        cursor: "pointer",
        fontWeight: 500,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
