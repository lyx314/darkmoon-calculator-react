import { existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { materials } from "../src/data/materials";
import {
  MASCOT_IMAGE,
  materialImageSrc,
  toImageFileName,
} from "../src/domain/materialImage";

const publicDir = new URL("../public/", import.meta.url);

function exists(src: string): boolean {
  return existsSync(fileURLToPath(new URL(src, publicDir)));
}

describe("素材文件与数据保持一致", () => {
  it("每种材料的三个品阶都有对应图片", () => {
    const missing = materials
      .flatMap((material) =>
        material.keys.map((key, tier) => ({ id: material.id, tier, key, src: materialImageSrc(key) })),
      )
      .filter((item) => !exists(item.src))
      .map((item) => `${item.id}-${item.tier} ${item.src}`);

    expect(missing).toEqual([]);
  });

  it("吉祥物图片存在", () => {
    for (const src of Object.values(MASCOT_IMAGE)) {
      expect(exists(src), src).toBe(true);
    }
  });

  it("文件名是语义化的 kebab-case", () => {
    for (const material of materials) {
      for (const key of material.keys) {
        expect(materialImageSrc(key)).toMatch(/^img\/materials\/[a-z0-9-]+\.webp$/);
      }
    }
  });

  it("materials 目录里没有多余的图片", () => {
    const expected = materials
      .flatMap((material) => material.keys)
      .map(toImageFileName)
      .sort();

    const actual = readdirSync(fileURLToPath(new URL("img/materials", publicDir)))
      .filter((name) => name.endsWith(".webp"))
      .sort();

    expect(actual).toEqual(expected);
  });
});
