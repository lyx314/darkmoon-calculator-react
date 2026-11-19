import type { DarkmoonData, EnemyConfig, Triplet } from "../domain/types";
import { enemyLevelRanges } from "./materials";

/** 全新用户（或清除数据后）的默认状态，与原版 userDefault.js 一致 */
export const DEFAULT_DATA: DarkmoonData = {
  format: "DARKMOON",
  currentID: 1,
  materialsNumbers: [],
  enemiesConfig: [],
  listOptions: {
    sortID: true,
    sortProgress: false,
    orderAscending: true,
    orderDescending: false,
    hideCompleted: false,
  },
  craftOptions: {
    sucroseBonus: false,
    doriBonus: false,
    noneBonus: true,
  },
  colorTheme: "cyan",
  isWorldLevel9: true,
};

/** 素材数量初始值 */
export const ZERO_NUMBERS: Triplet<number> = [0, 0, 0];

/**
 * 新增一行敌人时使用的默认配置。
 *
 * 原版写的是 `level: enemyLevelRanges.length`（= 21，越界），
 * 因为下拉框第一项恰好是索引 20，DOM 会立刻把它规范化成 20，
 * 所以这里直接用合法的最大值，行为一致。
 */
export function createEnemyConfig(): EnemyConfig {
  return {
    name: "",
    level: enemyLevelRanges.length - 1,
    number: 0,
    activated: true,
  };
}
