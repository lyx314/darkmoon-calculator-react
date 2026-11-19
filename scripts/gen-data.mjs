// 生成 src/data/materials.ts（从 extract-data.mjs 产出的 scripts/raw-data.json）
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const { materials, enemyLevelRanges } = JSON.parse(
  readFileSync(join(here, "raw-data.json"), "utf8"),
);

mkdirSync(`${root}/src/data`, { recursive: true });

/** 把 JSON 缩进成 2 空格、每个对象一行紧凑格式，保证 diff 可读 */
const body = materials
  .map((m) =>
    [
      "  {",
      `    id: ${m.id},`,
      `    type: ${JSON.stringify(m.type)},`,
      `    names: ${JSON.stringify(m.names)},`,
      `    keys: ${JSON.stringify(m.keys)},`,
      "    enemies: [",
      ...m.enemies.map(
        (e) =>
          `      { name: ${JSON.stringify(e.name)}, materialsPerEnemy: ${JSON.stringify(
            e.materialsPerEnemy,
          )}${e.temp ? ", temp: true" : ""} },`,
      ),
      "    ],",
      "  },",
    ].join("\n"),
  )
  .join("\n");

const file = `// 本文件由 scripts/gen-data.mjs 从原项目 Darkmoon-Calculator/scripts/data/materials.js 生成，请勿手工编辑。
import type { EnemyData, Material, Triplet } from "../domain/types";

type RawMaterial = {
  id: number;
  type: Material["type"];
  names: string[];
  keys: string[];
  enemies: { name: string; materialsPerEnemy: number[]; temp?: boolean }[];
};

const rawMaterials: RawMaterial[] = [
${body}
];

/** 53 种材料：19 普通 + 34 精英，id 1..53 */
export const materials: Material[] = rawMaterials.map((material) => ({
  id: material.id,
  type: material.type,
  names: material.names as Triplet<string>,
  keys: material.keys as Triplet<string>,
  enemies: material.enemies.map<EnemyData>((enemy) => ({
    name: enemy.name,
    materialsPerEnemy: enemy.materialsPerEnemy as Triplet<number>,
    temp: enemy.temp,
  })),
}));

/** 敌人等级区间选项，索引即为存储的 level 值 */
export const enemyLevelRanges: string[] = ${JSON.stringify(enemyLevelRanges, null, 2).replace(/\n/g, "\n")};
`;

writeFileSync(`${root}/src/data/materials.ts`, file, "utf8");
console.log("wrote materials.ts", file.length, "bytes;", materials.length, "materials;", enemyLevelRanges.length, "ranges");
