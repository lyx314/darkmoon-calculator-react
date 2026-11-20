import { beforeEach, describe, expect, it } from "vitest";

import { DEFAULT_DATA } from "../src/data/defaults";
import { materials } from "../src/data/materials";
import { NAV_ORDER, getMaterial } from "../src/domain/ordering";
import { getCurrentNumbers, useDarkmoonStore } from "../src/store/useDarkmoonStore";

/** 每个用例前把 store 重置成默认状态 */
function reset() {
  useDarkmoonStore.setState({ data: structuredClone(DEFAULT_DATA) });
}

const store = () => useDarkmoonStore.getState();

describe("zustand store 行为", () => {
  beforeEach(reset);

  it("setNumberAt 只改当前材料的数量", () => {
    store().setNumberAt(2, 42);
    expect(getCurrentNumbers(store().data).numbers).toEqual([0, 0, 42]);

    store().setNumberAt(0, 7);
    expect(getCurrentNumbers(store().data).numbers).toEqual([7, 0, 42]);

    // 只有一条记录
    expect(store().data.materialsNumbers).toHaveLength(1);
  });

  it("stepNumber 在 0 ~ 9999 边界外直接忽略", () => {
    store().setNumberAt(0, 0);
    store().stepNumber(0, -1);
    expect(getCurrentNumbers(store().data).numbers[0]).toBe(0);

    store().setNumberAt(0, 9999);
    store().stepNumber(0, 1);
    expect(getCurrentNumbers(store().data).numbers[0]).toBe(9999);

    store().stepNumber(0, -1);
    expect(getCurrentNumbers(store().data).numbers[0]).toBe(9998);
  });

  it("锁定 / 解锁保存快照", () => {
    store().setNumberAt(1, 30);
    store().lockCurrentNumbers();
    expect(getCurrentNumbers(store().data).lock).toEqual([0, 30, 0]);

    // 锁定后继续改动数量，快照不变
    store().setNumberAt(1, 50);
    expect(getCurrentNumbers(store().data).lock).toEqual([0, 30, 0]);

    store().unlockCurrentNumbers();
    expect(getCurrentNumbers(store().data).lock).toBeNull();
  });

  it("切换材料不会串数据", () => {
    store().setNumberAt(2, 10);
    store().selectMaterial(2);
    expect(getCurrentNumbers(store().data).numbers).toEqual([0, 0, 0]);

    store().setNumberAt(0, 5);
    store().selectMaterial(1);
    expect(getCurrentNumbers(store().data).numbers).toEqual([0, 0, 10]);

    // selectMaterial 会滚动页面，jsdom 里是空实现，不影响断言
  });

  it("上一个 / 下一个材料按「精英在前、id 升序」循环", () => {
    const first = NAV_ORDER[0];
    const second = NAV_ORDER[1];
    const last = NAV_ORDER[NAV_ORDER.length - 1];

    // 排序规则：精英材料全部排在普通材料之前
    expect(first.type).toBe("elite");
    expect(last.type).toBe("common");

    store().selectMaterial(first.id);
    store().goNextMaterial();
    expect(store().data.currentID).toBe(second.id);

    store().goPrevMaterial();
    expect(store().data.currentID).toBe(first.id);

    // 末尾继续往后会绕回第一个
    store().selectMaterial(last.id);
    store().goNextMaterial();
    expect(store().data.currentID).toBe(first.id);

    store().goPrevMaterial();
    expect(store().data.currentID).toBe(last.id);
  });

  it("敌人配置按材料 id 分组保存", () => {
    store().setEnemiesConfig([
      { name: "史莱姆", level: 20, number: 10, activated: true },
    ]);
    expect(store().data.enemiesConfig).toHaveLength(1);
    expect(store().data.enemiesConfig[0].id).toBe(1);

    store().selectMaterial(2);
    expect(
      store().data.enemiesConfig.find((item) => item.id === 2),
    ).toBeUndefined();

    store().setEnemiesConfig([
      { name: "丘丘人", level: 5, number: 3, activated: false },
    ]);
    expect(store().data.enemiesConfig).toHaveLength(2);
  });

  it("世界9 / 主题 / 排序 / 合成选项", () => {
    store().setWorldLevel9(false);
    expect(store().data.isWorldLevel9).toBe(false);

    store().setColorTheme("red");
    expect(store().data.colorTheme).toBe("red");

    store().setListOptions({ sortProgress: true });
    expect(store().data.listOptions.sortProgress).toBe(true);
    expect(store().data.listOptions.sortID).toBe(true); // 未传的字段保持不变

    store().setCraftMode("dori");
    expect(store().data.craftOptions).toEqual({
      sucroseBonus: false,
      doriBonus: true,
      noneBonus: false,
    });

    store().setCraftMode("none");
    expect(store().data.craftOptions.noneBonus).toBe(true);
  });

  it("setNumbersFor 直接改写指定材料，不改变当前选中", () => {
    // 当前是 id 1，改写 id 3
    store().setNumbersFor(3, [1, 2, 3]);

    expect(store().data.currentID).toBe(1);
    expect(getCurrentNumbers(store().data).numbers).toEqual([0, 0, 0]);

    const record = store().data.materialsNumbers.find((item) => item.id === 3);
    expect(record?.numbers).toEqual([1, 2, 3]);

    // 再次改写同一条记录应覆盖而不是新增
    store().setNumbersFor(3, [9, 9, 9]);
    expect(store().data.materialsNumbers.filter((item) => item.id === 3)).toHaveLength(1);
    expect(store().data.materialsNumbers.find((item) => item.id === 3)?.numbers).toEqual([9, 9, 9]);
  });

  it("未选中的材料也能被 setNumbersFor 记录（与面板输入互不干扰）", () => {
    store().setNumberAt(0, 5); // 当前材料
    store().setNumbersFor(2, [7, 0, 0]); // 另一个材料

    expect(getCurrentNumbers(store().data).numbers).toEqual([5, 0, 0]);
    expect(store().data.materialsNumbers.find((item) => item.id === 2)?.numbers).toEqual([7, 0, 0]);
  });

  it("clearAll 恢复默认并清掉锁定记录", () => {
    store().setNumberAt(0, 99);
    store().lockCurrentNumbers();
    store().setColorTheme("pink");

    store().clearAll();

    expect(store().data).toEqual(DEFAULT_DATA);
    expect(store().data.materialsNumbers).toHaveLength(0);
    expect(store().data.colorTheme).toBe("cyan");
  });

  it("未知材料 id 时回退到第一种材料", () => {
    expect(getMaterial(999).id).toBe(1);

    store().selectMaterial(999);
    expect(getCurrentNumbers(store().data).material.id).toBe(1);
  });

  it("getMaterial 对每个真实 id 都能取到对应材料", () => {
    for (const material of materials) {
      expect(getMaterial(material.id).id).toBe(material.id);
    }
  });
});
