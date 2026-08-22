const WELCOME_DISMISSED_KEY = "stockfolio_welcome_dismissed";

export const TRIAL_WALLET_BALANCE = 10_000;

export function isWelcomeDismissed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(WELCOME_DISMISSED_KEY) === "true";
}

export function setWelcomeDismissed(): void {
  localStorage.setItem(WELCOME_DISMISSED_KEY, "true");
}

export function clearWelcomeDismissed(): void {
  localStorage.removeItem(WELCOME_DISMISSED_KEY);
}
