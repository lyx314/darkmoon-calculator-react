import { Fragment, useEffect, useRef } from "react";

import {
  useCurrentID,
  useDarkmoonActions,
  useListOptions,
  useListRows,
} from "../store/selectors";
import { ProgressBar } from "./ui/ProgressBar";

export function MaterialList() {
  const listRows = useListRows();
  const options = useListOptions();
  const currentID = useCurrentID();
  const { setListOptions, selectMaterial } = useDarkmoonActions();
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
      <h2 className="flex shrink-0 items-end justify-between border-b-2 border-c9 p-[5px] text-[14px] font-semibold">
        材料一览
        <img
          src="img/kirara2.webp"
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
        <label htmlFor="list-sort-id" className="ml-[2px] text-[10px]">
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
        <label htmlFor="list-sort-progress" className="ml-[2px] text-[10px]">
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
        <label htmlFor="list-order-ascending" className="ml-[2px] text-[10px]">
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
        <label htmlFor="list-order-descending" className="ml-[2px] text-[10px]">
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
        <label htmlFor="hide-completed" className="ml-[2px] text-[10px]">
          隐藏毕业
        </label>
      </div>

      {/* 宽屏下这一栏自己滚动，标题与选项保持可见 */}
      <div
        ref={scrollRef}
        className="scroll-thin flex flex-col bg-white min-[860px]:min-h-0 min-[860px]:flex-1 min-[860px]:overflow-y-auto min-[860px]:pr-[2px]"
      >
        {listRows.map((row) => {
          const isCurrent = row.id === currentID;

          return (
            <button
              type="button"
              key={row.id}
              data-testid="list-row"
              data-current={isCurrent}
              aria-current={isCurrent ? "true" : undefined}
              onClick={() => selectMaterial(row.id)}
              className={`mt-[2px] flex w-full cursor-pointer items-center justify-between gap-[6px] rounded-[5px] px-[4px] transition-colors duration-300 hover:bg-c0 ${
                isCurrent ? "bg-c1" : ""
              } ${row.hidden ? "hidden" : ""}`}
            >
              {/* 左：三个品阶的图标 + 数量 */}
              <span className="flex shrink-0 items-center">
                {[2, 1, 0].map((index) => (
                  <Fragment key={index}>
                    <img
                      src={`img/${row.id}-${index}.webp`}
                      alt={row.names[index]}
                      width={40}
                      height={40}
                      loading="lazy"
                      decoding="async"
                      className="h-[40px] w-[40px]"
                    />
                    <span className="w-[35px] text-center text-[10px]">
                      {row.numbers[index]}
                    </span>
                  </Fragment>
                ))}
              </span>

              {/* 右：进度条 + 百分比，宽度富余时进度条自动变长 */}
              <span className="flex min-w-0 flex-1 items-center justify-end gap-[8px]">
                <ProgressBar
                  value={row.progress}
                  size="sm"
                  label={`${row.names[2]} 毕业进度`}
                  className="max-w-[110px] min-w-[56px] flex-1"
                />
                <span className="w-[42px] shrink-0 text-right text-[10px]">
                  {row.progress}%
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
