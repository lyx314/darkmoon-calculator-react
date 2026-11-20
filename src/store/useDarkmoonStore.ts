import { create } from "zustand";

import { DEFAULT_DATA, ZERO_NUMBERS } from "../data/defaults";
import { progress } from "../domain/calculator";
import { craftOptionsOf } from "../domain/craftMode";
import { getMaterial, numbersOf, orderMaterials } from "../domain/ordering";
import type {
  ColorTheme,
  CraftMode,
  DarkmoonData,
  EnemyConfig,
  ListOptions,
  Material,
  MaterialRecord,
  Triplet,
} from "../domain/types";
import { clearStoredData, loadData, saveData } from "./storage";

export interface DarkmoonStore {
  /** 唯一的状态源：与原版 localStorage / 导出 JSON 的结构完全一致 */
  data: DarkmoonData;

  setNumbers: (numbers: Triplet<number>) => void;
  /** 直接改写指定材料的数量（材料一览里 inline 编辑用） */
  setNumbersFor: (id: number, numbers: Triplet<number>) => void;
  setNumberAt: (index: 0 | 1 | 2, value: number) => void;
  stepNumber: (index: 0 | 1 | 2, delta: 1 | -1) => void;
  selectMaterial: (id: number) => void;
  goPrevMaterial: () => void;
  goNextMaterial: () => void;
  lockCurrentNumbers: () => void;
  unlockCurrentNumbers: () => void;
  setEnemiesConfig: (config: EnemyConfig[]) => void;
  setWorldLevel9: (value: boolean) => void;
  setColorTheme: (theme: ColorTheme) => void;
  setListOptions: (options: Partial<ListOptions>) => void;
  setCraftMode: (mode: CraftMode) => void;
  clearAll: () => void;
}

/** 更新（或创建）指定材料的数量记录，返回新的 data */
function withRecord(
  data: DarkmoonData,
  id: number,
  updater: (record: MaterialRecord) => MaterialRecord,
): DarkmoonData {
  const existing = data.materialsNumbers.find((item) => item.id === id);
  const next = updater(existing ?? { id, numbers: [...ZERO_NUMBERS], lock: null });

  return {
    ...data,
    materialsNumbers: existing
      ? data.materialsNumbers.map((item) => (item.id === id ? next : item))
      : [...data.materialsNumbers, next],
  };
}

/**
 * 「上一个 / 下一个」的切换顺序 = 右侧材料一览当前显示的顺序。
 *
 * 跟着列表的排序选项走（背包顺序 / 进度排序、升序 / 降序）；
 * 开了「隐藏毕业」时也跳过已毕业的材料，避免切到一个列表里看不到的条目。
 */
export function visibleOrder(data: DarkmoonData): Material[] {
  const ordered = orderMaterials(data.materialsNumbers, data.listOptions);
  if (!data.listOptions.hideCompleted) return ordered;

  return ordered.filter(
    (material) => progress(...numbersOf(data.materialsNumbers, material.id)) !== 100,
  );
}

export const useDarkmoonStore = create<DarkmoonStore>((set, get) => ({
  data: loadData(),

  setNumbers: (numbers) =>
    set((state) => ({
      data: withRecord(state.data, state.data.currentID, (record) => ({
        ...record,
        numbers: [...numbers] as Triplet<number>,
      })),
    })),

  setNumberAt: (index, value) => {    const { numbers } = getCurrentNumbers(get().data);
    const next = [...numbers] as Triplet<number>;
    next[index] = value;
    get().setNumbers(next);
  },

  stepNumber: (index, delta) => {
    const { numbers } = getCurrentNumbers(get().data);
    const value = numbers[index] + delta;
    // 与原版一致：超出 0 ~ 9999 的点击直接忽略
    if (value < 0 || value > 9999) return;

    const next = [...numbers] as Triplet<number>;
    next[index] = value;
    get().setNumbers(next);
  },

  setNumbersFor: (id, numbers) =>
    set((state) => ({
      data: withRecord(state.data, id, (record) => ({
        ...record,
        numbers: [...numbers] as Triplet<number>,
      })),
    })),

  selectMaterial: (id) => {
    if (get().data.currentID === id) return;
    set((state) => ({ data: { ...state.data, currentID: id } }));
    // 与原版一致：切换材料后回到页面顶部（无浏览器环境下跳过）
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  },

  goPrevMaterial: () => {
    const order = visibleOrder(get().data);
    if (order.length === 0) return;

    const index = order.findIndex((item) => item.id === get().data.currentID);
    // index === -1 说明当前材料不在可见顺序里（比如被「隐藏毕业」过滤掉），从末尾开始
    const prev = index === -1 ? order.length - 1 : (index - 1 + order.length) % order.length;
    get().selectMaterial(order[prev].id);
  },

  goNextMaterial: () => {
    const order = visibleOrder(get().data);
    if (order.length === 0) return;

    const index = order.findIndex((item) => item.id === get().data.currentID);
    const next = index === -1 ? 0 : (index + 1) % order.length;
    get().selectMaterial(order[next].id);
  },

  lockCurrentNumbers: () =>
    set((state) => ({
      data: withRecord(state.data, state.data.currentID, (record) => ({
        ...record,
        lock: [...record.numbers] as Triplet<number>,
      })),
    })),

  unlockCurrentNumbers: () =>
    set((state) => ({
      data: withRecord(state.data, state.data.currentID, (record) => ({
        ...record,
        lock: null,
      })),
    })),

  setEnemiesConfig: (config) =>
    set((state) => {
      const record = { id: state.data.currentID, config };
      const exists = state.data.enemiesConfig.some(
        (item) => item.id === state.data.currentID,
      );

      return {
        data: {
          ...state.data,
          enemiesConfig: exists
            ? state.data.enemiesConfig.map((item) =>
                item.id === state.data.currentID ? record : item,
              )
            : [...state.data.enemiesConfig, record],
        },
      };
    }),

  setWorldLevel9: (value) =>
    set((state) => ({ data: { ...state.data, isWorldLevel9: value } })),

  setColorTheme: (theme) =>
    set((state) => ({ data: { ...state.data, colorTheme: theme } })),

  setListOptions: (options) =>
    set((state) => ({
      data: { ...state.data, listOptions: { ...state.data.listOptions, ...options } },
    })),

  setCraftMode: (mode) =>
    set((state) => ({
      data: { ...state.data, craftOptions: craftOptionsOf(mode) },
    })),

  clearAll: () => {
    clearStoredData();
    set({ data: structuredClone(DEFAULT_DATA) });
  },
}));

/** 当前材料已填写的数量（内部工具） */export function getCurrentNumbers(data: DarkmoonData): {
  numbers: Triplet<number>;
  lock: Triplet<number> | null;
  material: ReturnType<typeof getMaterial>;
} {
  const record = data.materialsNumbers.find((item) => item.id === data.currentID);
  return {
    numbers: record?.numbers ?? ZERO_NUMBERS,
    lock: record?.lock ?? null,
    material: getMaterial(data.currentID),
  };
}

/**
 * 状态变更 -> localStorage。
 *
 * 只比较 `data` 引用，避免同一状态被写两次；
 * 放在模块级是因为 store 是单例，且需要在任何组件挂载前就生效。
 */
useDarkmoonStore.subscribe((state, previous) => {
  if (state.data !== previous.data) {
    saveData(state.data);
  }
});
