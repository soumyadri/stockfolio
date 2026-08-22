import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Card({ title, children, className = "" }: CardProps) {
  return (
    <section
      className={`h-full rounded-xl border border-[#2a2a2a] bg-[#111111] p-4 sm:p-5 lg:p-6 ${className}`}
    >
      {title && (
        <h2 className="mb-3 text-sm font-semibold text-white sm:mb-4 sm:text-base">{title}</h2>
      )}
      {children}
    </section>
  );
}
