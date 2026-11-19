import { IoSyncCircleOutline } from "react-icons/io5";

import type { CraftMode, Triplet } from "../domain/types";
import { isValidNumber } from "../domain/calculator";
import {
  useCraftMode,
  useCraftStats,
  useDarkmoonActions,
  useNumbers,
} from "../store/selectors";
import { textButton } from "./ui/buttonStyles";

const CRAFT_MODES: { value: CraftMode; label: string; id: string }[] = [
  { value: "sucrose", label: "砂糖", id: "sucrose-bonus" },
  { value: "dori", label: "多莉", id: "dori-bonus" },
  { value: "none", label: "无", id: "none-bonus" },
];

interface CraftBlockProps {
  title: string;
  complete: number;
  even: number;
  overflow: number;
  onCraft: () => void;
  testId: string;
}

function CraftBlock({
  title,
  complete,
  even,
  overflow,
  onCraft,
  testId,
}: CraftBlockProps) {
  return (
    <div className="flex flex-col items-center gap-[10px] overflow-hidden rounded-[10px] bg-c0 pb-[5px] shadow-[inset_0_0_2px_rgba(0,0,0,0.2)]">
      <h3 className="w-full bg-c6 p-[8px] text-center text-[11px] font-semibold text-white">
        {title}
      </h3>

      <div className="grid grid-cols-2 gap-x-[15px] gap-y-[10px] text-[10px] font-semibold">
        <span>毕 业</span>
        <span data-testid={`${testId}-complete`}>{complete}</span>
        <span>配 平</span>
        <span data-testid={`${testId}-even`}>{even}</span>
        <span>溢 出</span>
        <span data-testid={`${testId}-overflow`}>{overflow}</span>
      </div>

      <button type="button" onClick={onCraft} className={textButton.primary}>
        <IoSyncCircleOutline size={12} />
        合 成
      </button>
    </div>
  );
}

/** 合成面板：角色加成 + 中阶/高阶合成换算 */
export function CraftSection() {
  const numbers = useNumbers();
  const craftMode = useCraftMode();
  const craftStats = useCraftStats();
  const { setNumbers, setCraftMode } = useDarkmoonActions();

  /**
   * 按原版规则执行一次合成：3 个低阶换 1 个高阶，
   * 允许额外输入「砂糖/多莉」产生的附加材料。
   */
  const handleCraft = (rank: 0 | 1) => {
    const tier = rank === 1 ? "高阶" : "中阶";
    const raw = window.prompt(
      `请输入合成${tier}的数量。如果使用砂糖或多莉合成产生了额外的材料，请用空格分隔。例如：1000 100`,
    );
    if (raw === null) return;

    const parts = raw.trim().split(/\s+/);
    const amount = Number(parts[0]);
    const next = [...numbers] as Triplet<number>;

    next[rank + 1] += amount;
    next[rank] -= amount * 3;

    if (parts.length > 1) {
      const bonus = Number(parts[1]);
      if (craftMode === "sucrose") next[rank + 1] += bonus;
      if (craftMode === "dori") next[rank] += bonus;
    }

    if (!isValidNumber(next[rank]) || !isValidNumber(next[rank + 1])) {
      window.alert("Invalid input!");
      return;
    }

    setNumbers(next);
  };

  return (
    <section className="my-[10px] grid grid-cols-2 gap-x-[10px] gap-y-[10px] rounded-[10px] bg-c1 p-[10px] shadow-[0_0_5px_rgba(0,0,0,0.2)]">
      <div className="col-span-2 flex items-center justify-center text-[10px] font-semibold">
        {CRAFT_MODES.map((mode) => (
          <span key={mode.value} className="flex items-center">
            <input
              type="radio"
              id={mode.id}
              name="craft-bonus"
              value={mode.value}
              checked={craftMode === mode.value}
              onChange={() => setCraftMode(mode.value)}
              className="ml-[8px] mr-[2px] accent-c9"
            />
            <label htmlFor={mode.id} className="cursor-pointer">
              {mode.label}
            </label>
          </span>
        ))}
      </div>

      <CraftBlock
        title="合 成 高 阶"
        testId="craft-high"
        complete={craftStats.complete[1]}
        even={craftStats.even[1]}
        overflow={craftStats.overflow[2]}
        onCraft={() => handleCraft(1)}
      />

      <CraftBlock
        title="合 成 中 阶"
        testId="craft-medium"
        complete={craftStats.complete[0]}
        even={craftStats.even[0]}
        overflow={craftStats.overflow[1]}
        onCraft={() => handleCraft(0)}
      />

      {craftStats.risky && (
        <p className="col-span-2 text-center text-[8px]">
          当前材料数量有溢出风险，请谨慎合成！
        </p>
      )}
    </section>
  );
}
