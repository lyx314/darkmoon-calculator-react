import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { materials } from "../src/data/materials";
import {
  Calculator as NewCalculator,
  progress as newProgress,
  weight as newWeight,
} from "../src/domain/calculator";
import type { EnemyConfig, Triplet } from "../src/domain/types";
// @ts-expect-error 原版为无类型的 JS 实现，仅用于对拍
import { Calculator as LegacyCalculator } from "../legacy/calculator.js";

/** 固定种子的伪随机数，保证测试可复现 */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const material = materials[0]; // 史莱姆：2 种敌人
const enemiesData = material.enemies.map((enemy) => ({
  ...enemy,
  materialsPerEnemy: [...enemy.materialsPerEnemy] as Triplet<number>,
}));

// 原版 setEnemies 里有调试用的 console.log，对拍时静音
let originalLog: typeof console.log;
beforeAll(() => {
  originalLog = console.log;
  console.log = () => {};
});
afterAll(() => {
  console.log = originalLog;
});

function legacyEnemiesData() {
  return material.enemies.map((enemy) => ({
    ...enemy,
    materialsPerEnemy: [...enemy.materialsPerEnemy] as Triplet<number>,
  }));
}

function randomConfig(random: () => number): EnemyConfig[] {
  const rows = 1 + Math.floor(random() * 3);
  return Array.from({ length: rows }, () => ({
    name: enemiesData[Math.floor(random() * enemiesData.length)].name,
    level: Math.floor(random() * 21),
    number: Math.floor(random() * 21),
    activated: random() > 0.25,
  }));
}

describe("折算与进度公式", () => {
  it("weight 为低 + 中*3 + 高*9", () => {
    expect(newWeight(1, 2, 3)).toBe(1 + 6 + 27);
  });

  it("progress 满配为 100、空为 0", () => {
    expect(newProgress(9999, 9999, 9999)).toBe(100);
    expect(newProgress(0, 0, 0)).toBe(0);
    // 只有高阶满配：9 / (1 + 3 + 9) = 69.23%
    expect(newProgress(0, 0, 9999)).toBe(69.23);
  });

  it("progress 保留两位小数", () => {
    expect(newProgress(1, 0, 0)).toBe(0);
    expect(newProgress(10, 20, 30)).toBe(
      Number(((10 + 60 + 270) / (9999 * 13) * 100).toFixed(2)),
    );
  });
});

describe("与原版 Calculator 数值对拍", () => {
  it("每车材料 / 新增车数 / 配平次数 完全一致（120 组随机数据）", () => {
    const random = mulberry32(20261120);

    for (let i = 0; i < 120; i += 1) {
      const numbers = [
        Math.floor(random() * 9999),
        Math.floor(random() * 9999),
        Math.floor(random() * 9999),
      ] as Triplet<number>;
      const config = randomConfig(random);
      const isWorldLevel9 = random() > 0.5;
      const sucrose = random() > 0.5;
      const dori = random() > 0.5;

      const next = new NewCalculator(numbers);
      next.setEnemies(enemiesData, config, isWorldLevel9);

      const legacy = new LegacyCalculator(numbers);
      legacy.setEnemies(legacyEnemiesData(), config, isWorldLevel9);

      /**
       * 每车材料：新版用原生 number 运算，第 4 位小数可能与原版的
       * 十进制 BigNumber 存在半分位舍入差异（例如 3.69765 会得到
       * 3.6976 而非 3.6977），因此这里用 3 位精度比对。
       */
      for (let k = 0; k < 3; k += 1) {
        expect(next.materialsPerRun[k]).toBeCloseTo(
          legacy.materialsPerRun[k],
          3,
        );
      }

      next.trim(sucrose, dori);
      legacy.trim(sucrose, dori);
      expect(next.craftCount).toEqual(legacy.craftCount);

      // 锁定快照后的新增车数
      const init = [
        Math.floor(random() * 500),
        Math.floor(random() * 500),
        Math.floor(random() * 500),
      ] as Triplet<number>;
      next.setInitNumbers(init);
      legacy.setInitNumbers(init);

      const nextIncreased = next.increasement();
      const legacyIncreased = legacy.increasement();
      expect(typeof nextIncreased).toBe(typeof legacyIncreased);

      if (typeof nextIncreased === "number" && typeof legacyIncreased === "number") {
        // 受上面「每车材料」万分位差异影响，新增车数允许 ~1e-4 的相对误差
        expect(
          Math.abs(nextIncreased - legacyIncreased) /
            Math.max(1, Math.abs(legacyIncreased)),
        ).toBeLessThan(1e-4);
      } else {
        expect(nextIncreased).toBe(legacyIncreased);
      }
    }
  });

  it("「毕业」次数（overflow 之后的 craftCount）与原版一致（12 组）", () => {
    const random = mulberry32(20260101);

    for (let i = 0; i < 12; i += 1) {
      const numbers = [
        Math.floor(random() * 200),
        Math.floor(random() * 200),
        Math.floor(random() * 200),
      ] as Triplet<number>;
      const config = randomConfig(random);
      const isWorldLevel9 = random() > 0.5;
      const sucrose = i % 2 === 0;
      const dori = i % 3 === 0;

      const next = new NewCalculator(numbers);
      next.setEnemies(enemiesData, config, isWorldLevel9);
      next.trim(sucrose, dori);
      next.overflow(sucrose, dori);

      const legacy = new LegacyCalculator(numbers);
      legacy.setEnemies(legacyEnemiesData(), config, isWorldLevel9);
      legacy.trim(sucrose, dori);
      legacy.overflow(sucrose, dori);

      expect(next.craftCount).toEqual(legacy.craftCount);
    }
  });

  it("剩余车数与溢出量完全一致（12 组小样本）", () => {
    const random = mulberry32(42);

    for (let i = 0; i < 12; i += 1) {
      const numbers = [
        Math.floor(random() * 40),
        Math.floor(random() * 40),
        Math.floor(random() * 40),
      ] as Triplet<number>;
      const config = randomConfig(random);
      const isWorldLevel9 = random() > 0.5;
      const sucrose = i % 2 === 0;
      const dori = i % 3 === 0;

      const next = new NewCalculator(numbers);
      next.setEnemies(enemiesData, config, isWorldLevel9);
      next.calculateRun(sucrose, dori);

      const legacy = new LegacyCalculator(numbers);
      legacy.setEnemies(legacyEnemiesData(), config, isWorldLevel9);
      legacy.calculateRun(sucrose, dori);

      expect(next.leftRunTimes).toBe(legacy.leftRunTimes);

      const nextOverflow = new NewCalculator(numbers);
      nextOverflow.setEnemies(enemiesData, config, isWorldLevel9);
      const legacyOverflow = new LegacyCalculator(numbers);
      legacyOverflow.setEnemies(legacyEnemiesData(), config, isWorldLevel9);

      expect(nextOverflow.overflow(sucrose, dori)).toEqual(
        legacyOverflow.overflow(sucrose, dori),
      );
    }
  });
});
