import { IoAddCircleOutline, IoCloseCircleOutline } from "react-icons/io5";

import { createEnemyConfig } from "../data/defaults";
import { enemyLevelRanges } from "../data/materials";
import { materialImageSrc } from "../domain/materialImage";
import type { EnemyConfig } from "../domain/types";
import {
  useCurrentMaterial,
  useDarkmoonActions,
  useEnemiesConfig,
  useEnemyStats,
} from "../store/selectors";
import { NumberInput } from "./NumberInput";
import { iconButton } from "./ui/buttonStyles";

const selectClass =
  "w-[100px] cursor-pointer rounded-full border-none p-[4px] text-center text-[10px] text-c9 focus:shadow-[0_0_2px_var(--color-9)] focus:outline-none max-sm:w-[80px]";

/** 敌人配置区域：每车材料统计 + 敌人/等级/数量配置行 */
export function EnemySection() {
  const currentMaterial = useCurrentMaterial();
  const enemiesConfig = useEnemiesConfig();
  const enemyStats = useEnemyStats();
  const { setEnemiesConfig } = useDarkmoonActions();

  const enemyNames = currentMaterial.enemies.map((enemy) => enemy.name);

  // 原版在没有配置时会插入一行默认配置，这里用「虚拟行」达到同样效果，
  // 首次编辑时才真正写回数据。
  const rows: EnemyConfig[] =
    enemiesConfig.length > 0
      ? enemiesConfig
      : [{ ...createEnemyConfig(), name: enemyNames[0] ?? "" }];

  const updateRow = (index: number, patch: Partial<EnemyConfig>) => {
    setEnemiesConfig(
      rows.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  };

  const removeRow = (index: number) => {
    setEnemiesConfig(rows.filter((_, i) => i !== index));
  };

  const addRow = () => {
    setEnemiesConfig([
      ...rows,
      { ...createEnemyConfig(), name: enemyNames[0] ?? "" },
    ]);
  };

  return (
    <section className="my-[10px] rounded-[10px] bg-c1 p-[10px] shadow-[0_0_5px_rgba(0,0,0,0.2)]">
      <div className="mb-[10px] flex flex-col gap-[10px] rounded-[10px] bg-c0 p-[10px] text-[10px] font-semibold shadow-[inset_0_0_2px_rgba(0,0,0,0.2)]">
        <div>
          剩余车数
          <span data-testid="left-run-times" className="mx-[10px]">
            {enemyStats.leftRunTimes}
          </span>
        </div>
        <div>
          新增车数
          <span data-testid="increased-run-times" className="mx-[10px]">
            {enemyStats.increasedRunTimes}
          </span>
        </div>
        <div>
          每车进度
          <span data-testid="progress-per-run" className="mx-[10px]">
            {enemyStats.progressPerRun}%
          </span>
        </div>
        <div className="flex items-center">
          每车材料
          {[2, 1, 0].map((index) => (
            <span key={index} className="flex items-center">
              <img
                src={materialImageSrc(currentMaterial.keys[index])}
                alt={currentMaterial.names[index]}
                className="ml-[8px] w-[20px]"
              />
              <span className="ml-[2px]">{enemyStats.materialsPerRun[index]}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="mb-[10px] grid grid-cols-[10px_repeat(3,1fr)_20px] items-center justify-items-center text-[10px] font-semibold">
        <div />
        <div>敌 人</div>
        <div>等 级</div>
        <div>数 量</div>
        <div />
      </div>

      <div className="grid grid-cols-[10px_repeat(3,1fr)_20px] items-center justify-items-center gap-y-[10px]">
        {rows.map((row, index) => (
          <div key={index} className="contents">
            <input
              type="checkbox"
              aria-label="启用该敌人"
              checked={row.activated}
              onChange={(event) =>
                updateRow(index, { activated: event.target.checked })
              }
              className="h-[10px] w-[10px] accent-c9"
            />

            <select
              aria-label="敌人"
              value={row.name}
              onChange={(event) => updateRow(index, { name: event.target.value })}
              className={selectClass}
            >
              {enemyNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>

            <select
              aria-label="等级"
              value={row.level}
              onChange={(event) =>
                updateRow(index, { level: Number(event.target.value) })
              }
              className={selectClass}
            >
              {enemyLevelRanges.map((range, level) => (
                <option key={range} value={level}>
                  {range}
                </option>
              ))}
            </select>

            <NumberInput
              value={row.number}
              ariaLabel="敌人数量"
              onCommit={(value) => updateRow(index, { number: value })}
              className="w-[100px] rounded-full border-none p-[4px] text-center text-[10px] text-c9 focus:shadow-[0_0_2px_var(--color-9)] focus:outline-none max-sm:w-[80px]"
            />

            <button
              type="button"
              aria-label="删除该行"
              onClick={() => removeRow(index)}
              className={iconButton}
            >
              <IoCloseCircleOutline size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-[10px] text-center">
        <button
          type="button"
          aria-label="添加敌人"
          onClick={addRow}
          className={iconButton}
        >
          <IoAddCircleOutline size={20} />
        </button>
      </div>
    </section>
  );
}
