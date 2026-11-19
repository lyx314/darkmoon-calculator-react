import type { ColorTheme } from "./types";

/** 13 套配色，顺序与 index.html 的下拉框一致 */
export const COLOR_THEMES: readonly ColorTheme[] = [
  "cyan",
  "gray",
  "red",
  "pink",
  "grape",
  "violet",
  "indigo",
  "blue",
  "teal",
  "green",
  "lime",
  "yellow",
  "orange",
] as const;

/** 下拉框显示文案（沿用原版的英文名） */
export const THEME_LABELS: Record<ColorTheme, string> = {
  cyan: "Cyan",
  gray: "Gray",
  red: "Red",
  pink: "Pink",
  grape: "Grape",
  violet: "Violet",
  indigo: "Indigo",
  blue: "Blue",
  teal: "Teal",
  green: "Green",
  lime: "Lime",
  yellow: "Yellow",
  orange: "Orange",
};

export function isColorTheme(value: unknown): value is ColorTheme {
  return (
    typeof value === "string" && (COLOR_THEMES as readonly string[]).includes(value)
  );
}
