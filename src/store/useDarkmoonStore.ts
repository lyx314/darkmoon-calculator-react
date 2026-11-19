import { create } from "zustand";

import { DEFAULT_DATA, ZERO_NUMBERS } from "../data/defaults";
import { craftOptionsOf } from "../domain/craftMode";
import { NAV_ORDER, getMaterial } from "../domain/ordering";
import type {
  ColorTheme,
  CraftMode,
  DarkmoonData,
  EnemyConfig,
  ListOptions,
  MaterialRecord,
  Triplet,
} from "../domain/types";
import { clearStoredData, loadData, saveData } from "./storage";

export interface DarkmoonStore {
  /** 唯一的状态源：与原版 localStorage / 导出 JSON 的结构完全一致 */
  data: DarkmoonData;

  setNumbers: (numbers: Triplet<number>) => void;
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

export const useDarkmoonStore = create<DarkmoonStore>((set, get) => ({
  data: loadData(),

  setNumbers: (numbers) =>
    set((state) => ({
      data: withRecord(state.data, state.data.currentID, (record) => ({
        ...record,
        numbers: [...numbers] as Triplet<number>,
      })),
    })),

  setNumberAt: (index, value) => {
    const { numbers } = getCurrentNumbers(get().data);
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

  selectMaterial: (id) => {
    if (get().data.currentID === id) return;
    set((state) => ({ data: { ...state.data, currentID: id } }));
    // 与原版一致：切换材料后回到页面顶部（无浏览器环境下跳过）
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  },

  goPrevMaterial: () => {
    const { currentID } = get().data;
    const index = NAV_ORDER.findIndex((item) => item.id === currentID);
    const prev = index > 0 ? index - 1 : NAV_ORDER.length - 1;
    get().selectMaterial(NAV_ORDER[prev].id);
  },

  goNextMaterial: () => {
    const { currentID } = get().data;
    const index = NAV_ORDER.findIndex((item) => item.id === currentID);
    const next = index < NAV_ORDER.length - 1 ? index + 1 : 0;
    get().selectMaterial(NAV_ORDER[next].id);
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

/** 当前材料已填写的数量（内部工具） */
export function getCurrentNumbers(data: DarkmoonData): {
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
