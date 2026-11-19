/**
 * 从原版仓库的 scripts/data/*.js 里提取数据（仅一次性使用）。
 *
 * 用法（默认读取同级目录下的原版仓库）：
 *   node scripts/extract-data.mjs [原版scripts/data路径] [输出json路径]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(
  process.argv[2] ?? join(here, "..", "..", "Darkmoon-Calculator", "scripts", "data"),
);
const OUT = resolve(process.argv[3] ?? join(here, "raw-data.json"));

/** 把 `export const xxx = {...}` 当成表达式求值，不执行其它代码 */
function load(file, exportName) {
  const text = readFileSync(join(SRC, file), "utf8");
  const start = text.indexOf("=", text.indexOf(`export const ${exportName}`)) + 1;
  const body = text.slice(start).trim().replace(/;\s*$/, "");
  return new Function(`"use strict"; return (${body});`)();
}

const materials = load("materials.js", "materials");
const enemyLevelRanges = load("enemyLevelRanges.js", "enemyLevelRanges");
const userDefault = load("userDefault.js", "userDefault");

writeFileSync(OUT, JSON.stringify({ materials, enemyLevelRanges, userDefault }, null, 2));

const byType = materials.reduce(
  (acc, m) => ((acc[m.type] = (acc[m.type] ?? 0) + 1), acc),
  {},
);
console.log(`materials: ${materials.length}`, byType);
console.log(`level ranges: ${enemyLevelRanges.length}`);
console.log(`wrote ${OUT}`);
