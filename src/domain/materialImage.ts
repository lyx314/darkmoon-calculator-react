/**
 * 材料图片路径。
 *
 * 文件按物品 key 命名（`SlimeCondensate` -> `slime-condensate.webp`），
 * 而不是用材料 id + 品阶下标。好处是图片名自带语义，且不会因为数据里
 * 材料顺序或 id 调整而错位。
 *
 * 注意：`toImageFileName` 的转换规则必须和 `scripts/rename-material-images.py`
 * 保持一致；`tests/images.test.ts` 会检查每个材料对应的文件确实存在。
 */

/** 三个品阶的通用后缀 */
export const TIER_KEYS = ["low", "medium", "high"] as const;

/** PascalCase 的 key -> kebab-case 文件名 */
export function toImageFileName(key: string): string {
  return (
    key
      .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
      .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
      .toLowerCase() + ".webp"
  );
}

/** 材料图片的 <img src>，按物品 key 取图 */
export function materialImageSrc(key: string): string {
  return `img/materials/${toImageFileName(key)}`;
}

/** 页面上的吉祥物图片 */
export const MASCOT_IMAGE = {
  title: "img/kirara-title.webp",
  list: "img/kirara-list.webp",
} as const;
