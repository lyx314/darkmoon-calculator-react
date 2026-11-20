import { Fragment, useEffect, useRef } from "react";

import { MASCOT_IMAGE, materialImageSrc } from "../domain/materialImage";
import type { Triplet } from "../domain/types";
import {
  useCurrentID,
  useDarkmoonActions,
  useListOptions,
  useListRows,
} from "../store/selectors";
import { NumberInput } from "./NumberInput";
import { cellField } from "./ui/fieldStyles";
import { ProgressBar } from "./ui/ProgressBar";

export function MaterialList() {
  const listRows = useListRows();
  const options = useListOptions();
  const currentID = useCurrentID();
  const { setListOptions, selectMaterial, setNumbersFor } = useDarkmoonActions();
  const scrollRef = useRef<HTMLDivElement>(null);

  // 用上下箭头切换材料时，把当前行滚到列表可视区中间。
  // 只操作列表自身的 scrollTop（不用 scrollIntoView），避免窄屏下把整个页面滚走。
  // 首次挂载不滚：刚打开时列表应该从顶部开始，而不是一开始就停在中间。
  const previousID = useRef(currentID);

  useEffect(() => {
    if (previousID.current === currentID) return;
    previousID.current = currentID;

    const scroller = scrollRef.current;
    if (!scroller || scroller.scrollHeight <= scroller.clientHeight) return;

    const frame = requestAnimationFrame(() => {
      const row = scroller.querySelector<HTMLElement>('[data-current="true"]');
      if (!row) return;

      const rowRect = row.getBoundingClientRect();
      const boxRect = scroller.getBoundingClientRect();
      const offset =
        rowRect.top - boxRect.top - (boxRect.height - rowRect.height) / 2;
      scroller.scrollTop += offset;
    });

    return () => cancelAnimationFrame(frame);
  }, [currentID]);

  return (
    <section className="my-[20px] flex min-h-0 flex-col min-[860px]:my-0 min-[860px]:h-full">
      <h2 className="flex shrink-0 items-end justify-between border-b-2 border-c9 p-[5px] text-[15px] font-semibold">
        材料一览
        <img
          src={MASCOT_IMAGE.list}
          alt=""
          className="translate-y-[15%] w-[40px]"
        />
      </h2>

      <div className="flex shrink-0 items-center justify-end p-[5px]">
        <input
          type="radio"
          id="list-sort-id"
          name="list-sort"
          checked={options.sortID}
          onChange={() =>
            setListOptions({ sortID: true, sortProgress: false })
          }
          className="ml-[8px] accent-c9"
        />
        <label htmlFor="list-sort-id" className="ml-[2px] text-[11px]">
          背包顺序
        </label>

        <input
          type="radio"
          id="list-sort-progress"
          name="list-sort"
          checked={options.sortProgress}
          onChange={() =>
            setListOptions({ sortID: false, sortProgress: true })
          }
          className="ml-[8px] accent-c9"
        />
        <label htmlFor="list-sort-progress" className="ml-[2px] text-[11px]">
          进度排序
        </label>

        <input
          type="radio"
          id="list-order-ascending"
          name="list-order"
          checked={options.orderAscending}
          onChange={() =>
            setListOptions({ orderAscending: true, orderDescending: false })
          }
          className="ml-[8px] accent-c9"
        />
        <label htmlFor="list-order-ascending" className="ml-[2px] text-[11px]">
          升序
        </label>

        <input
          type="radio"
          id="list-order-descending"
          name="list-order"
          checked={options.orderDescending}
          onChange={() =>
            setListOptions({ orderAscending: false, orderDescending: true })
          }
          className="ml-[8px] accent-c9"
        />
        <label htmlFor="list-order-descending" className="ml-[2px] text-[11px]">
          降序
        </label>

        <input
          type="checkbox"
          id="hide-completed"
          checked={options.hideCompleted}
          onChange={(event) =>
            setListOptions({ hideCompleted: event.target.checked })
          }
          className="ml-[8px] accent-c9"
        />
        <label htmlFor="hide-completed" className="ml-[2px] text-[11px]">
          隐藏毕业
        </label>
      </div>

      {/* 宽屏下这一栏自己滚动，标题与选项保持可见 */}
      <div
        ref={scrollRef}
        className="scroll-thin flex flex-col bg-white min-[860px]:min-h-0 min-[860px]:flex-1 min-[860px]:overflow-y-auto min-[860px]:pr-[2px] min-[860px]:pb-[10px]"
      >
        {listRows.map((row) => {
          const isCurrent = row.id === currentID;

          return (
            /*
              整行是一块可点击区域（用来切换材料），但数字格要能直接输入。
              做法：铺一个绝对定位的按钮承接整行点击，内容层 pointer-events-none，
              只有输入框重新开启 pointer-events。这样既保留键盘可达的“选择”按钮，
              又不用把 input 塞进 button 里（那是非法嵌套）。
            */
            <div
              key={row.id}
              data-testid="list-row"
              data-current={isCurrent}
              aria-current={isCurrent ? "true" : undefined}
              className={`relative mt-[2px] flex w-full items-center justify-between gap-[6px] rounded-[5px] px-[4px] transition-colors duration-300 hover:bg-c0 ${
                isCurrent ? "bg-c1" : ""
              } ${row.hidden ? "hidden" : ""}`}
            >
              <button
                type="button"
                aria-label={`切换到 ${row.names[2]}`}
                onClick={() => selectMaterial(row.id)}
                className="absolute inset-0 cursor-pointer rounded-[5px] focus-visible:ring-2 focus-visible:ring-c6 focus-visible:ring-inset focus-visible:outline-none"
              />

              {/* 左：三个品阶的图标 + 可输入的数量 */}
              <span className="pointer-events-none relative flex shrink-0 items-center">
                {[2, 1, 0].map((index) => (
                  <Fragment key={index}>
                    <img
                      src={materialImageSrc(row.keys[index])}
                      alt={row.names[index]}
                      width={40}
                      height={40}
                      loading="lazy"
                      decoding="async"
                      className="h-[40px] w-[40px]"
                    />
                    <NumberInput
                      value={row.numbers[index]}
                      ariaLabel={`${row.names[index]} 数量（材料一览）`}
                      onCommit={(value) => {
                        const next = [...row.numbers] as Triplet<number>;
                        next[index] = value;
                        setNumbersFor(row.id, next);
                      }}
                      className={`pointer-events-auto mx-[2px] w-[38px] ${cellField}`}
                    />
                  </Fragment>
                ))}
              </span>

              {/* 右：进度条 + 百分比，宽度富余时进度条自动变长 */}
              <span className="pointer-events-none relative flex min-w-0 flex-1 items-center justify-end gap-[8px]">
                <ProgressBar
                  value={row.progress}
                  size="sm"
                  label={`${row.names[2]} 毕业进度`}
                  className="max-w-[110px] min-w-[56px] flex-1"
                />
                <span className="w-[42px] shrink-0 text-right text-[11px]">
                  {row.progress}%
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
