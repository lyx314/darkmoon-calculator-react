/**
 * 输入框样式。
 *
 * 和 `Select` 共用同一套外观：白底胶囊、24px 高、主题色描边聚焦环，
 * 这样面板里的「敌人 / 等级 / 数量」三者看起来才是一个控件组。
 */

/** 面板里的数字输入框（材料数量、敌人数量） */
export const panelField =
  "h-[24px] rounded-full border-none bg-white px-[10px] " +
  "text-center font-semibold text-c9 " +
  "focus:shadow-[0_0_0_1px_var(--color-6)] focus:outline-none";

/**
 * 材料一览行内的紧凑输入框。
 *
 * 列表一格只有 38px 宽，做成白胶囊会糊成一片，所以保持透明，
 * 用 hover / 聚焦的背景和描边来提示可编辑。
 */
export const cellField =
  "h-[19px] rounded-[4px] border-none bg-transparent px-[2px] " +
  "text-center text-[11px] text-c9 transition-colors " +
  "hover:bg-c0 focus:bg-white focus:shadow-[0_0_0_1px_var(--color-6)] focus:outline-none";
