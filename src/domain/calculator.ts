import type { CraftOptions, EnemyConfig, EnemyData, Triplet } from "./types";

/** 材料数量上限，达到即视为「毕业」 */
export const MAX_MATERIAL = 9999;

/** 校验数量是否合法：0 ~ 9999 的整数 */
export function isValidNumber(x: number): boolean {
  return Number.isInteger(x) && x >= 0 && x <= MAX_MATERIAL;
}

/**
 * 材料折算权重：1 个高阶 = 3 个中阶 = 9 个低阶。
 * 与原版 `Calculator.weight` 完全一致。
 */
export function weight(low: number, medium: number, high: number): number {
  return low + medium * 3 + high * 9;
}

const TOTAL_WEIGHT = weight(MAX_MATERIAL, MAX_MATERIAL, MAX_MATERIAL);

/**
 * 计算毕业进度百分比（0 ~ 100，理论上可超过 100）。
 * @param d 保留小数位，默认 2
 */
export function progress(
  low: number,
  medium: number,
  high: number,
  d = 2,
): number {
  const current = weight(low, medium, high);
  return Number(((current / TOTAL_WEIGHT) * 100).toFixed(d));
}

/** 敌人等级系数：Lv.90 以上（区间索引 >= 18）为 1，否则 (level + 12) / 30 */
export function enemyLevelCoeff(level: number): number {
  return level >= 18 ? 1 : (level + 12) / 30;
}

/** 三元组向量加法 */
export function addTriplet(
  a: Triplet<number>,
  b: Triplet<number>,
): Triplet<number> {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

export interface EnemyStatsResult {
  leftRunTimes: number | "-";
  progressPerRun: number;
  materialsPerRun: Triplet<number>;
  /** 未锁定快照时为 "-" */
  increasedRunTimes: number | "-";
}

const ZERO_TRIPLET: Triplet<number> = [0, 0, 0];

/**
 * 依据敌人配置推算「每车材料 / 每车进度 / 剩余车数 / 新增车数」。
 *
 * 对应原版 `darkmoon.js` 的 `displayStatistics()`。
 */
export function computeEnemyStats(params: {
  numbers: Triplet<number>;
  lockNumbers: Triplet<number> | null;
  enemies: EnemyData[];
  enemiesConfig: EnemyConfig[];
  isWorldLevel9: boolean;
  craftOptions: CraftOptions;
}): EnemyStatsResult {
  const {
    numbers,
    lockNumbers,
    enemies,
    enemiesConfig,
    isWorldLevel9,
    craftOptions,
  } = params;

  const calc = new Calculator(numbers);
  calc.setEnemies(enemies, enemiesConfig, isWorldLevel9);

  // 新增车数：需要锁定快照才能计算
  let increasedRunTimes: number | "-" = "-";
  if (lockNumbers) {
    calc.setInitNumbers(lockNumbers);
    increasedRunTimes = calc.increasement();
  }

  const materialsPerRun = calc.materialsPerRun;
  const progressPerRun = progress(
    materialsPerRun[0],
    materialsPerRun[1],
    materialsPerRun[2],
  );

  // 注意：calculateRun 会重置内部状态，必须放在最后调用
  calc.calculateRun(craftOptions.sucroseBonus, craftOptions.doriBonus);

  return {
    leftRunTimes: calc.leftRunTimes,
    progressPerRun,
    materialsPerRun,
    increasedRunTimes,
  };
}

export interface CraftStatsResult {
  /** 「配平」次数 [中阶, 高阶]：当前数量能合成多少次 */
  even: [number, number];
  /**
   * 「毕业」次数 [中阶, 高阶]。
   *
   * 注意：原版是在 `overflow()`（内部会 reset 并重跑一整轮毕业模拟）
   * 之后才读取 craftCount 的，所以显示的是「从当前数量刷到全 9999 需要合成多少次」，
   * 而不是当前能合成多少次 —— 这里保持完全一致。
   */
  complete: [number, number];
  /** 「溢出」[低阶占位, 中阶, 高阶] */
  overflow: Triplet<number>;
}

/**
 * 依据当前数量推算合成面板的 毕业 / 配平 / 溢出。
 *
 * 对应原版 `darkmoon.js` 的 `displayCraft()`，包括其中依赖调用顺序的细节。
 */
export function computeCraftStats(params: {
  numbers: Triplet<number>;
  enemies: EnemyData[];
  enemiesConfig: EnemyConfig[];
  isWorldLevel9: boolean;
  craftOptions: CraftOptions;
}): CraftStatsResult {
  const { numbers, enemies, enemiesConfig, isWorldLevel9, craftOptions } = params;
  const { sucroseBonus, doriBonus } = craftOptions;

  const calc = new Calculator(numbers);
  calc.setEnemies(enemies, enemiesConfig, isWorldLevel9);

  // ① 配平：当前数量能向下合成多少次
  calc.trim(sucroseBonus, doriBonus);
  const even: [number, number] = [calc.craftCount[0], calc.craftCount[1]];

  // ② 溢出 + 毕业：以「掉落最多低阶材料的敌人」模拟刷到全部毕业
  const overflow = calc.overflow(sucroseBonus, doriBonus);
  const complete: [number, number] = [calc.craftCount[0], calc.craftCount[1]];

  return { even, complete, overflow };
}

/**
 * 合成模拟器。
 *
 * 逐行移植自原版 `scripts/calculator.js`，但内部改用原生 number 运算。
 * 合成本身只会产生 0.1 / 0.25 这类步进，数量级也远小于 2^53，
 * 普通浮点足够；显示前按原版的小数位四舍五入即可。
 */
export class Calculator {
  private readonly numbersHold: Triplet<number>;
  private numbers: number[];
  private initNumbers?: Triplet<number>;
  private enemiesData: EnemyData[] = [];

  /** 剩余车数；0 表示当前已毕业 */
  leftRunTimes: number | "-" = 0;
  /** 中阶 / 高阶的合成次数 */
  craftCount: [number, number] = [0, 0];
  /** 每车材料期望 [低, 中, 高] */
  materialsPerRun: Triplet<number> = [...ZERO_TRIPLET];

  constructor(numbers: Triplet<number>) {
    this.numbersHold = [...numbers];
    this.numbers = [...this.numbersHold];
  }

  /** 重置模拟状态（回到玩家填写的初始数量） */
  reset(): void {
    this.numbers = [...this.numbersHold];
    this.leftRunTimes = 0;
    this.craftCount = [0, 0];
  }

  /**
   * 汇总敌人掉落，得到每车材料期望。
   * @param isWorldLevel9 世界等级 9 时掉落系数额外提升
   */
  setEnemies(
    enemiesData: EnemyData[],
    enemiesConfig: EnemyConfig[],
    isWorldLevel9 = true,
  ): void {
    this.enemiesData = enemiesData;
    const materialsPerRun: number[] = [...ZERO_TRIPLET];

    for (const config of enemiesConfig) {
      if (!config.activated) continue;
      const enemy = enemiesData.find((item) => item.name === config.name);
      if (!enemy) continue; // 配置里的敌人名已不在当前材料数据中，跳过

      let coeff = enemyLevelCoeff(config.level);
      if (isWorldLevel9) {
        coeff = config.level === 20 ? coeff * 1.5 : coeff * 1.25;
      }
      if (enemy.temp) {
        coeff = 1;
      }

      for (let i = 0; i < 3; i += 1) {
        materialsPerRun[i] += enemy.materialsPerEnemy[i] * coeff * config.number;
      }
    }

    // 与原版一致的 4 位小数取整
    this.materialsPerRun = materialsPerRun.map((num) =>
      num >= 0 ? Number(num.toFixed(4)) : 0,
    ) as Triplet<number>;
  }

  /** 设置锁定时的数量快照，用于计算「新增车数」 */
  setInitNumbers(numbers: Triplet<number>): void {
    this.initNumbers = [...numbers];
  }

  /** 相对锁定快照还需要刷多少车 */
  increasement(): number | "-" {
    if (!this.initNumbers) return "-";

    const diff = this.numbersHold.map(
      (num, i) => num - this.initNumbers![i],
    ) as Triplet<number>;
    const diffWeight = weight(diff[0], diff[1], diff[2]);
    const oneRunWeight = weight(
      this.materialsPerRun[0],
      this.materialsPerRun[1],
      this.materialsPerRun[2],
    );
    if (!oneRunWeight) return "-";

    return Number((diffWeight / oneRunWeight).toFixed(1));
  }

  /** 三种材料是否都达到 9999 */
  completed(): boolean {
    return this.numbers.every((num) => num >= MAX_MATERIAL);
  }

  private addToNumbers(arr: Triplet<number>): void {
    for (let i = 0; i < 3; i += 1) {
      this.numbers[i] += arr[i];
    }
  }

  /** 指定档位是否还能继续合成 */
  private validCraft(index: number): boolean {
    return (
      this.numbers[index] > this.numbers[index + 1] &&
      this.numbers[index] >= 3 &&
      this.numbers[index + 1] < MAX_MATERIAL
    );
  }

  /** 执行一次合成：3 个低阶 -> 1 个高阶（计入角色加成） */
  private craft(rank: 0 | 1, sucrose: boolean, dori: boolean): void {
    this.craftCount[rank] += 1;
    this.numbers[rank] -= 3;
    this.numbers[rank + 1] += 1;
    if (sucrose) {
      this.numbers[rank + 1] += 0.1;
    }
    if (dori) {
      this.numbers[rank] += 0.25;
    }
  }

  /** 交替向上合成，直到没有任何可合成的档位 */
  trim(sucrose: boolean, dori: boolean): void {
    const medium = 0 as const;
    const high = 1 as const;

    while (this.validCraft(medium)) {
      this.craft(medium, sucrose, dori);
      while (this.validCraft(high)) {
        this.craft(high, sucrose, dori);
      }
    }
    while (this.validCraft(high)) {
      this.craft(high, sucrose, dori);
      while (this.validCraft(medium)) {
        this.craft(medium, sucrose, dori);
      }
    }
  }

  /** 模拟刷本直到三种材料全部毕业，得出剩余车数 */
  calculateRun(sucrose: boolean, dori: boolean): void {
    if (this.materialsPerRun[0] === 0) {
      this.leftRunTimes = "-";
      return;
    }
    this.reset();
    this.trim(sucrose, dori);
    while (!this.completed()) {
      this.addToNumbers(this.materialsPerRun);
      this.leftRunTimes = (this.leftRunTimes as number) + 1;
      this.trim(sucrose, dori);
    }
  }

  /**
   * 以「低阶掉落最多的敌人」模拟整轮毕业，返回相对 9999 的溢出量。
   */
  overflow(sucrose: boolean, dori: boolean): Triplet<number> {
    const sorted = [...this.enemiesData].sort(
      (a, b) => b.materialsPerEnemy[0] - a.materialsPerEnemy[0],
    );
    const top = sorted[0];
    this.materialsPerRun = top
      ? ([...top.materialsPerEnemy] as Triplet<number>)
      : [...ZERO_TRIPLET];

    this.calculateRun(sucrose, dori);

    return this.numbers.map((num) =>
      Number((num - MAX_MATERIAL).toFixed(1)),
    ) as Triplet<number>;
  }
}
