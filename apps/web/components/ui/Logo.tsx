interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = "", showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8 shrink-0"
        aria-hidden
      >
        <rect x="1" y="1" width="30" height="30" rx="8" fill="#111111" stroke="#2a2a2a" />
        <path
          d="M8 21L13 16L17 18.5L24 10"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="24" cy="10" r="2.5" fill="#22c55e" />
        <path
          d="M8 23H24"
          stroke="#3a3a3a"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>

      {showText && (
        <span className="text-base font-semibold tracking-tight text-white sm:text-lg">
          Stockfolio
        </span>
      )}
    </div>
  );
}
