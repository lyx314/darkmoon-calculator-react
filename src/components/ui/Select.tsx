import type { ReactNode, SelectHTMLAttributes } from "react";
import { IoChevronDownOutline } from "react-icons/io5";

type SelectVariant = "primary" | "plain";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /** primary：深色胶囊，用于导航栏；plain：白底胶囊，用于表单行 */
  variant?: SelectVariant;
  /** 控制宽度的类名（组件本身不设宽度） */
  className?: string;
  children: ReactNode;
}

const variantClass: Record<SelectVariant, string> = {
  // 与导航栏按钮同高同字号
  primary: "h-[24px] bg-c8 px-[10px] text-[10px] text-white",
  // 与敌人配置行的输入框、敌人下拉同一尺寸
  plain: "h-[24px] bg-white px-[14px] text-[11px] text-c9",
};

/**
 * 统一风格的下拉框。
 *
 * 原生 `<select>` 的箭头由系统绘制，和这套胶囊风格对不上，所以用 `appearance-none`
 * 去掉，再叠一个跟随文字颜色的自定义箭头（`pointer-events-none`，点击仍然落在 select 上）。
 */
export function Select({
  variant = "plain",
  className = "",
  children,
  ...rest
}: SelectProps) {
  return (
    <span className={`relative inline-flex items-center ${className}`}>
      <select
        {...rest}
        className={`w-full cursor-pointer appearance-none rounded-full border-none text-center font-semibold focus:shadow-[0_0_0_1px_var(--color-6)] focus:outline-none ${variantClass[variant]}`}
      >
        {children}
      </select>

      <IoChevronDownOutline
        size={variant === "primary" ? 10 : 11}
        aria-hidden
        className={`pointer-events-none absolute right-[5px] ${
          variant === "primary" ? "text-white" : "text-c9"
        }`}
      />
    </span>
  );
}
