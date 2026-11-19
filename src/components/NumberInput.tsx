import { useState } from "react";

import { isValidNumber } from "../domain/calculator";

interface NumberInputProps {
  value: number;
  onCommit: (value: number) => void;
  className?: string;
  placeholder?: string;
  ariaLabel?: string;
}

/**
 * 数量输入框。
 *
 * 沿用原版行为：输入过程中不打断用户，失焦或回车时才校验并提交；
 * 非法输入（非 0 ~ 9999 的整数）会弹出提示并还原。
 *
 * 实现要点：只有「正在编辑」时才持有草稿值（`draft !== null`）。
 * 非编辑状态下直接显示 props 的值，因此外部改动（加减按钮、切换材料、
 * 导入数据）会立刻反映到界面上，不会慢一拍。
 */
export function NumberInput({
  value,
  onCommit,
  className = "",
  placeholder = "0",
  ariaLabel,
}: NumberInputProps) {
  const [draft, setDraft] = useState<string | null>(null);

  const display = draft ?? (value === 0 ? "" : String(value));

  const startEditing = () => {
    setDraft(value === 0 ? "" : String(value));
  };

  const commit = () => {
    if (draft === null) return;

    const trimmed = draft.trim();
    const parsed = trimmed === "" ? 0 : Number(trimmed);

    if (!isValidNumber(parsed)) {
      window.alert("请输入 0 ~ 9999 的整数。");
      setDraft(null); // 丢弃非法输入，还原成外部值
      return;
    }

    setDraft(null);
    if (parsed !== value) onCommit(parsed);
  };

  return (
    <input
      type="number"
      inputMode="numeric"
      aria-label={ariaLabel}
      placeholder={placeholder}
      value={display}
      onFocus={startEditing}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.currentTarget.blur();
        }
        if (event.key === "Escape") {
          setDraft(null);
          event.currentTarget.blur();
        }
      }}
      className={className}
    />
  );
}
