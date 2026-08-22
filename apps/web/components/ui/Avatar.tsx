import Image from "next/image";

const DEFAULT_AVATAR = "/avatars/default-user.svg";

interface AvatarProps {
  src?: string;
  alt: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-9 w-9",
  lg: "h-12 w-12",
};

export function getAvatarUrl(seed: string): string {
  return `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
}

export function Avatar({ src, alt, size = "md", className = "" }: AvatarProps) {
  const imageSrc = src ?? DEFAULT_AVATAR;

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full border border-[#3a3a3a] bg-[#1a1a1a] ${sizeClasses[size]} ${className}`}
    >
      <Image
        src={imageSrc}
        alt={alt}
        fill
        className="object-cover"
        sizes={size === "lg" ? "48px" : size === "md" ? "36px" : "32px"}
        unoptimized={imageSrc.startsWith("https://")}
      />
    </div>
  );
}
