export function getApiOrigin(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  try {
    return new URL(apiUrl).origin;
  } catch {
    return "http://localhost:4000";
  }
}

export const DICEBEAR_ORIGIN = "https://api.dicebear.com";
