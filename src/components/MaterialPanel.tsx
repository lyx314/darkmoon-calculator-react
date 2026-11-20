import {
  IoAddCircleOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoLockClosedOutline,
  IoLockOpenOutline,
  IoRemoveCircleOutline,
} from "react-icons/io5";

import { materialImageSrc } from "../domain/materialImage";
import {
  useCurrentMaterial,
  useDarkmoonActions,
  useLockNumbers,
  useNumbers,
  useProgressValue,
} from "../store/selectors";
import { NumberInput } from "./NumberInput";
import { iconButton } from "./ui/buttonStyles";
import { ProgressBar } from "./ui/ProgressBar";

/** 面板中三个材料的显示顺序：高阶 -> 中阶 -> 低阶（与原版一致） */
const PANEL_ORDER = [2, 1, 0] as const;

export function MaterialPanel() {
  const currentMaterial = useCurrentMaterial();
  const names = currentMaterial.names;
  const numbers = useNumbers();
  const lockNumbers = useLockNumbers();
  const progressValue = useProgressValue();

  const {
    setNumberAt,
    stepNumber,
    goPrevMaterial,
    goNextMaterial,
    lockCurrentNumbers,
    unlockCurrentNumbers,
  } = useDarkmoonActions();

  const locked = lockNumbers !== null;

  return (
    <section className="relative mx-auto rounded-[10px] bg-c1 px-[20px] py-[10px] shadow-[0_0_5px_rgba(0,0,0,0.2)]">
      {/* 锁定 / 解锁当前材料数量 */}
      {locked ? (
        <button
          type="button"
          aria-label="解锁初始数量"
          title="解锁初始数量"
          onClick={unlockCurrentNumbers}
          className={`${iconButton} absolute top-[10px] right-[10px]`}
        >
          <IoLockClosedOutline size={18} />
        </button>
      ) : (
        <button
          type="button"
          aria-label="锁定初始数量"
          title="锁定初始数量"
          onClick={lockCurrentNumbers}
          className={`${iconButton} absolute top-[10px] right-[10px]`}
        >
          <IoLockOpenOutline size={18} />
        </button>
      )}

      {/* 上一个 / 下一个材料 */}
      <button
        type="button"
        aria-label="上一个材料"
        onClick={goPrevMaterial}
        className={`${iconButton} absolute top-[45%] left-0`}
      >
        <IoChevronBackOutline size={24} />
      </button>
      <button
        type="button"
        aria-label="下一个材料"
        onClick={goNextMaterial}
        className={`${iconButton} absolute top-[45%] right-0`}
      >
        <IoChevronForwardOutline size={24} />
      </button>

      <p
        data-testid="progress-value"
        className="text-center text-[22px] font-semibold text-c8"
      >
        {progressValue}%
      </p>

      <ProgressBar
        value={progressValue}
        label={`${currentMaterial.names[2]} 毕业进度`}
        className="mx-auto mt-[5px] mb-[20px] w-1/2"
      />

      <div className="flex items-center justify-around">
        {PANEL_ORDER.map((index) => (
          <div key={index} className="flex flex-col items-center gap-[6px]">
            <div className="overflow-hidden rounded-full bg-white shadow-[inset_0_0_4px_rgba(0,0,0,0.2)]">
              <img
                src={materialImageSrc(currentMaterial.keys[index])}
                alt={names[index]}
                className="w-[80px] transition-transform duration-300 hover:scale-110"
              />
            </div>

            <span className="text-[11px] font-semibold">{names[index]}</span>

            <NumberInput
              value={numbers[index]}
              onCommit={(value) => setNumberAt(index, value)}
              ariaLabel={`${names[index]} 数量`}
              className="w-[80px] rounded-full border-none py-[2px] text-center text-[13px] font-semibold text-c9 focus:shadow-[0_0_2px_var(--color-9)] focus:outline-none"
            />

            <div className="flex w-[80px] items-center justify-between">
              <button
                type="button"
                aria-label={`减少 ${names[index]}`}
                onClick={() => stepNumber(index, -1)}
                className={iconButton}
              >
                <IoRemoveCircleOutline size={20} />
              </button>

              <span className="text-[11px]">
                {locked && lockNumbers ? lockNumbers[index] : ""}
              </span>

              <button
                type="button"
                aria-label={`增加 ${names[index]}`}
                onClick={() => stepNumber(index, 1)}
                className={iconButton}
              >
                <IoAddCircleOutline size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
