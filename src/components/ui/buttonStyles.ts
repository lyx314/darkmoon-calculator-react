/**
 * 统一的按钮样式。
 *
 * 全站按钮只有三种形态，避免各处各写一套：
 * - primary：实心主题色，用于主要操作（清除、世界9 开启、合成）
 * - outline：白底描边，用于「未开启」的开关态
 * - icon：无底色的图标按钮，hover 放大
 *
 * 尺寸统一为 24px 高、10px 字号、胶囊圆角，和输入框 / 下拉框保持一致。
 */

const textBase =
  "inline-flex h-[24px] items-center justify-center gap-[5px] rounded-full px-[10px] " +
  "text-[10px] font-semibold select-none cursor-pointer " +
  "transition-all duration-200 active:scale-95";

export const textButton = {
  primary: `${textBase} border-none bg-c8 text-white hover:bg-c7`,
  outline: `${textBase} border border-c4 bg-white text-c8 hover:bg-c0`,
} as const;

export const iconButton =
  "cursor-pointer rounded-full text-c9 transition-transform duration-200 " +
  "hover:scale-110 active:scale-95";

/** 下拉框等「伪按钮」控件，跟文本按钮保持同样的尺寸与圆角 */
export const selectLike =
  "h-[24px] cursor-pointer rounded-full border-none bg-c8 px-[10px] " +
  "text-[10px] font-semibold text-white focus:outline-none";
