/**
 * 领域模型类型定义。
 *
 * 字段命名刻意与原版（Darkmoon-Calculator/scripts/data/*.js）保持一致，
 * 这样导出的 DARKMOON 格式 JSON 可以在原版与新版本之间双向互通。
 */

/** 固定长度为 3 的元组：低阶 / 中阶 / 高阶 */
export type Triplet<T = number> = [T, T, T];

/** 材料分类：普通材料 / 精英材料 */
export type MaterialType = "common" | "elite";

/** 敌人及其掉落期望（每次击杀的期望材料数，低/中/高阶） */
export interface EnemyData {
  name: string;
  materialsPerEnemy: Triplet<number>;
  /** 临时活动敌人：不受等级系数影响（保留字段，当前数据未使用） */
  temp?: boolean;
}

/** 一种材料（三种品阶 + 可能掉落它的敌人） */
export interface Material {
  id: number;
  type: MaterialType;
  /** 低 / 中 / 高阶材料名 */
  names: Triplet<string>;
  /** GOOD 格式导入用的物品 key，顺序与 names 一致 */
  keys: Triplet<string>;
  enemies: EnemyData[];
}

/** 玩家为某种材料填写的数量记录 */
export interface MaterialRecord {
  id: number;
  numbers: Triplet<number>;
  /** 锁定时的快照，null 表示未锁定 */
  lock: Triplet<number> | null;
}

/** 某种材料对应的敌人配置行 */
export interface EnemyConfig {
  name: string;
  /** enemyLevelRanges 的索引 */
  level: number;
  number: number;
  activated: boolean;
}

/** 敌人配置按材料 id 分组存储 */
export interface EnemiesConfigRecord {
  id: number;
  config: EnemyConfig[];
}

/** 「材料一览」的排序/过滤选项 */
export interface ListOptions {
  sortID: boolean;
  sortProgress: boolean;
  orderAscending: boolean;
  orderDescending: boolean;
  hideCompleted: boolean;
}

/** 合成加成角色选项 */
export interface CraftOptions {
  sucroseBonus: boolean;
  doriBonus: boolean;
  noneBonus: boolean;
}

/** 合成加成角色（三选一，由 CraftOptions 派生） */
export type CraftMode = "sucrose" | "dori" | "none";

/** 13 套配色主题 */
export type ColorTheme =
  | "cyan"
  | "gray"
  | "red"
  | "pink"
  | "grape"
  | "violet"
  | "indigo"
  | "blue"
  | "teal"
  | "green"
  | "lime"
  | "yellow"
  | "orange";

/** 持久化到 localStorage 的完整数据结构（等同于原版的 `data` 对象） */
export interface DarkmoonData {
  format: "DARKMOON";
  currentID: number;
  materialsNumbers: MaterialRecord[];
  enemiesConfig: EnemiesConfigRecord[];
  listOptions: ListOptions;
  craftOptions: CraftOptions;
  colorTheme: ColorTheme;
  isWorldLevel9: boolean;
}

/** 「合成」面板里两种合成档位 */
export type CraftRank = 0 | 1; // 0 = 中阶，1 = 高阶
