interface ProgressBarProps {
  /** 进度百分比，允许超过 100（数值按 100 截断，文字仍显示真实值） */
  value: number;
  /** sm：列表行内使用（5px）；md：主面板使用（7px + 内阴影） */
  size?: "sm" | "md";
  /** 无障碍名称，用于说明这条进度代表什么 */
  label: string;
  /** 宽度等布局类由调用方决定，避免和组件内自带的宽度类冲突 */
  className?: string;
}

/**
 * 进度条。
 *
 * 轨道 + 填充两层 div，填充宽度由行内 style 控制；
 * 颜色取自当前主题（border-c6 / bg-c6），换主题自动跟随。
 */
export function ProgressBar({
  value,
  size = "md",
  label,
  className = "",
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(value, 100));

  const sizeClass =
    size === "md"
      ? "h-[7px] shadow-[inset_0_0_2px_rgba(0,0,0,0.4)]"
      : "h-[5px]";

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      // 溢出时 aria-valuenow 会被截断，这里保留真实百分比
      aria-valuetext={`${value}%`}
      className={`overflow-hidden rounded-full border border-c6 bg-white ${sizeClass} ${className}`}
    >
      <div
        className="h-full rounded-full bg-c6 transition-[width] duration-300 ease-out"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
