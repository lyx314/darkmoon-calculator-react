import type { CraftMode, CraftOptions } from "./types";

/** CraftOptions（三个互斥布尔值）-> 单一模式 */
export function craftModeOf(options: CraftOptions): CraftMode {
  if (options.sucroseBonus) return "sucrose";
  if (options.doriBonus) return "dori";
  return "none";
}

/** 单一模式 -> CraftOptions */
export function craftOptionsOf(mode: CraftMode): CraftOptions {
  return {
    sucroseBonus: mode === "sucrose",
    doriBonus: mode === "dori",
    noneBonus: mode === "none",
  };
}
