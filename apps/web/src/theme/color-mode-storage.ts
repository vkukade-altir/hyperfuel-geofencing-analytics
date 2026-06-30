const STORAGE_KEY = "visit-analytics-color-mode";

export type ColorMode = "light" | "dark";

export function readStoredColorMode(): ColorMode {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "dark" ? "dark" : "light";
}

export function writeStoredColorMode(mode: ColorMode): void {
  window.localStorage.setItem(STORAGE_KEY, mode);
}
