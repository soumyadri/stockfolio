import type { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export function PageContainer({ children, className = "" }: PageContainerProps) {
  return (
    <div className={`mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-12 ${className}`}>
      {children}
    </div>
  );
}
