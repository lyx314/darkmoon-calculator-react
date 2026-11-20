import { materials } from "../data/materials";
import { progress } from "./calculator";
import type { ListOptions, Material, MaterialRecord, Triplet } from "./types";

const ZERO: Triplet<number> = [0, 0, 0];

/** 按 id 排序，并把精英材料排在普通材料之前（对应原版 sortMaterialsByID） */
export function sortMaterialsByID(desc: boolean): Material[] {
  const sorted = [...materials].sort((a, b) => (desc ? b.id - a.id : a.id - b.id));
  const elite = sorted.filter((item) => item.type === "elite");
  const common = sorted.filter((item) => item.type === "common");
  return desc ? [...common, ...elite] : [...elite, ...common];
}

export function getMaterial(id: number): Material {
  return materials.find((item) => item.id === id) ?? materials[0];
}

/** 取某种材料已填写的数量，没有记录时返回 [0, 0, 0] */
export function numbersOf(
  records: MaterialRecord[],
  id: number,
): Triplet<number> {
  return records.find((item) => item.id === id)?.numbers ?? ZERO;
}

/** 按清单选项排序（对应原版 sortMaterialsByProgress / sortMaterialsByID） */
export function orderMaterials(
  records: MaterialRecord[],
  options: ListOptions,
): Material[] {
  if (!options.sortProgress) {
    return sortMaterialsByID(options.orderDescending);
  }
  return [...materials].sort((a, b) => {
    const pa = progress(...numbersOf(records, a.id));
    const pb = progress(...numbersOf(records, b.id));
    return options.orderDescending ? pb - pa : pa - pb;
  });
}
