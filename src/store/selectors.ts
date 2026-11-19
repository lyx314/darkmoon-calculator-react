import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { ZERO_NUMBERS } from "../data/defaults";
import {
  computeCraftStats,
  computeEnemyStats,
  progress,
  type CraftStatsResult,
  type EnemyStatsResult,
} from "../domain/calculator";
import { craftModeOf } from "../domain/craftMode";
import { getMaterial, orderMaterials } from "../domain/ordering";
import type {
  ColorTheme,
  CraftMode,
  EnemyConfig,
  ListOptions,
  Material,
  Triplet,
} from "../domain/types";
import { useDarkmoonStore } from "./useDarkmoonStore";

/** 清单行（派生数据） */
export interface ListRow {
  id: number;
  names: Triplet<string>;
  numbers: Triplet<number>;
  progress: number;
  hidden: boolean;
}

const EMPTY_CONFIG: EnemyConfig[] = [];

/* ---------------------------------- 基础 ---------------------------------- */

export function useCurrentID(): number {
  return useDarkmoonStore((state) => state.data.currentID);
}

export function useCurrentMaterial(): Material {
  const id = useCurrentID();
  return useMemo(() => getMaterial(id), [id]);
}

export function useNumbers(): Triplet<number> {
  const records = useDarkmoonStore((state) => state.data.materialsNumbers);
  const id = useCurrentID();
  return useMemo(
    () => records.find((item) => item.id === id)?.numbers ?? ZERO_NUMBERS,
    [records, id],
  );
}

export function useLockNumbers(): Triplet<number> | null {
  const records = useDarkmoonStore((state) => state.data.materialsNumbers);
  const id = useCurrentID();
  return useMemo(
    () => records.find((item) => item.id === id)?.lock ?? null,
    [records, id],
  );
}

export function useProgressValue(): number {
  const numbers = useNumbers();
  return useMemo(() => progress(...numbers), [numbers]);
}

export function useEnemiesConfig(): EnemyConfig[] {
  const records = useDarkmoonStore((state) => state.data.enemiesConfig);
  const id = useCurrentID();
  return useMemo(
    () => records.find((item) => item.id === id)?.config ?? EMPTY_CONFIG,
    [records, id],
  );
}

export function useColorTheme(): ColorTheme {
  return useDarkmoonStore((state) => state.data.colorTheme);
}

export function useIsWorldLevel9(): boolean {
  return useDarkmoonStore((state) => state.data.isWorldLevel9);
}

export function useListOptions(): ListOptions {
  return useDarkmoonStore((state) => state.data.listOptions);
}

export function useCraftMode(): CraftMode {
  const craftOptions = useDarkmoonStore((state) => state.data.craftOptions);
  return useMemo(() => craftModeOf(craftOptions), [craftOptions]);
}

/* ---------------------------------- 派生 ---------------------------------- */

/** 每车材料 / 每车进度 / 剩余车数 / 新增车数 */
export function useEnemyStats(): EnemyStatsResult {
  const numbers = useNumbers();
  const lockNumbers = useLockNumbers();
  const currentMaterial = useCurrentMaterial();
  const enemiesConfig = useEnemiesConfig();
  const isWorldLevel9 = useIsWorldLevel9();
  const craftOptions = useDarkmoonStore((state) => state.data.craftOptions);

  return useMemo(
    () =>
      computeEnemyStats({
        numbers,
        lockNumbers,
        enemies: currentMaterial.enemies,
        enemiesConfig,
        isWorldLevel9,
        craftOptions,
      }),
    [
      numbers,
      lockNumbers,
      currentMaterial,
      enemiesConfig,
      isWorldLevel9,
      craftOptions,
    ],
  );
}

/** 合成面板的 毕业 / 配平 / 溢出 */
export function useCraftStats(): CraftStatsResult {
  const numbers = useNumbers();
  const currentMaterial = useCurrentMaterial();
  const enemiesConfig = useEnemiesConfig();
  const isWorldLevel9 = useIsWorldLevel9();
  const craftOptions = useDarkmoonStore((state) => state.data.craftOptions);

  return useMemo(
    () =>
      computeCraftStats({
        numbers,
        enemies: currentMaterial.enemies,
        enemiesConfig,
        isWorldLevel9,
        craftOptions,
      }),
    [numbers, currentMaterial, enemiesConfig, isWorldLevel9, craftOptions],
  );
}

/** 材料一览的可见行 */
export function useListRows(): ListRow[] {
  const records = useDarkmoonStore((state) => state.data.materialsNumbers);
  const listOptions = useListOptions();

  return useMemo(() => {
    return orderMaterials(records, listOptions).map((material) => {
      const numbers =
        records.find((item) => item.id === material.id)?.numbers ?? ZERO_NUMBERS;
      const percent = progress(...numbers);
      return {
        id: material.id,
        names: material.names,
        numbers,
        progress: percent,
        hidden: listOptions.hideCompleted && percent === 100,
      };
    });
  }, [records, listOptions]);
}

/* ---------------------------------- 操作 ---------------------------------- */

/** 所有 action（引用恒定，不触发额外渲染） */
export function useDarkmoonActions() {
  return useDarkmoonStore(
    useShallow((state) => ({
      setNumbers: state.setNumbers,
      setNumberAt: state.setNumberAt,
      stepNumber: state.stepNumber,
      selectMaterial: state.selectMaterial,
      goPrevMaterial: state.goPrevMaterial,
      goNextMaterial: state.goNextMaterial,
      lockCurrentNumbers: state.lockCurrentNumbers,
      unlockCurrentNumbers: state.unlockCurrentNumbers,
      setEnemiesConfig: state.setEnemiesConfig,
      setWorldLevel9: state.setWorldLevel9,
      setColorTheme: state.setColorTheme,
      setListOptions: state.setListOptions,
      setCraftMode: state.setCraftMode,
      clearAll: state.clearAll,
    })),
  );
}
