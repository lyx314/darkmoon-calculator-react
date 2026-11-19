/**
 * 行为对比：把同一组操作分别施加到「原版」和「新版」页面，
 * 逐项比对所有可见数值，确保重构后行为完全一致。
 *
 * 用法：
 *   node scripts/serve-static.mjs <原版目录> 4174 &
 *   pnpm build && pnpm preview --port 4173 &
 *   node scripts/compare.mjs
 */
import { chromium } from "playwright-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const LEGACY_URL = "http://127.0.0.1:4174/";
const NEXT_URL = "http://localhost:4173/";

const SELECTORS = {
  legacy: {
    progress: ".progress-value",
    numbers: ".material-input",
    leftRun: ".left-run-times",
    increased: ".increased-run-times",
    perRun: ".progress-per-run",
    enemyNumber: ".input-enemy-number",
    highComplete: ".craft-high-complete",
    highEven: ".craft-high-even",
    highOverflow: ".craft-high-overflow",
    mediumComplete: ".craft-medium-complete",
    mediumEven: ".craft-medium-even",
    mediumOverflow: ".craft-medium-overflow",
    listRows: ".list-row",
  },
  next: {
    progress: '[data-testid="progress-value"]',
    numbers: 'section:first-of-type input[type="number"]',
    leftRun: '[data-testid="left-run-times"]',
    increased: '[data-testid="increased-run-times"]',
    perRun: '[data-testid="progress-per-run"]',
    enemyNumber: '[aria-label="敌人数量"]',
    highComplete: '[data-testid="craft-high-complete"]',
    highEven: '[data-testid="craft-high-even"]',
    highOverflow: '[data-testid="craft-high-overflow"]',
    mediumComplete: '[data-testid="craft-medium-complete"]',
    mediumEven: '[data-testid="craft-medium-even"]',
    mediumOverflow: '[data-testid="craft-medium-overflow"]',
    listRows: '[data-testid="list-row"]',
  },
};

const failures = [];

async function readState(page, kind) {
  const s = SELECTORS[kind];
  return page.evaluate((sel) => {
    const text = (selector) => {
      const el = document.querySelector(selector);
      return el ? el.textContent.trim() : "<missing>";
    };
    const numbers = [...document.querySelectorAll(sel.numbers)].map((el) => el.value);
    return {
      progress: text(sel.progress),
      numbers: numbers.join(","),
      leftRun: text(sel.leftRun),
      increased: text(sel.increased),
      perRun: text(sel.perRun),
      highComplete: text(sel.highComplete),
      highEven: text(sel.highEven),
      highOverflow: text(sel.highOverflow),
      mediumComplete: text(sel.mediumComplete),
      mediumEven: text(sel.mediumEven),
      mediumOverflow: text(sel.mediumOverflow),
      listRows: document.querySelectorAll(sel.listRows).length,
    };
  }, s);
}

function compare(label, legacy, next) {
  const keys = Object.keys(legacy);
  const diffs = keys.filter((key) => String(legacy[key]) !== String(next[key]));
  if (diffs.length === 0) {
    console.log(`  ok   ${label}`);
  } else {
    for (const key of diffs) {
      console.log(`  FAIL ${label} -> ${key}: 原版=${legacy[key]} 新版=${next[key]}`);
      failures.push(`${label}.${key}`);
    }
  }
}

const browser = await chromium.launch({ executablePath: EDGE, headless: true });

async function openPage(url) {
  const context = await browser.newContext({
    viewport: { width: 420, height: 1400 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  return page;
}

try {
  const legacyPage = await openPage(LEGACY_URL);
  const nextPage = await openPage(NEXT_URL);

  console.log("\n[A] 初始状态");
  compare(
    "初始数值一致",
    await readState(legacyPage, "legacy"),
    await readState(nextPage, "next"),
  );

  console.log("\n[B] 填写材料数量 高=100 中=50 低=20");
  for (const [page, kind] of [
    [legacyPage, "legacy"],
    [nextPage, "next"],
  ]) {
    const inputs = page.locator(SELECTORS[kind].numbers);
    await inputs.nth(0).fill("100");
    await inputs.nth(0).blur();
    await inputs.nth(1).fill("50");
    await inputs.nth(1).blur();
    await inputs.nth(2).fill("20");
    await inputs.nth(2).blur();
    await page.waitForTimeout(300);
  }
  compare(
    "数量与合成统计一致",
    await readState(legacyPage, "legacy"),
    await readState(nextPage, "next"),
  );

  console.log("\n[C] 配置敌人数量 = 10");
  for (const [page, kind] of [
    [legacyPage, "legacy"],
    [nextPage, "next"],
  ]) {
    const input = page.locator(SELECTORS[kind].enemyNumber).first();
    await input.fill("10");
    await input.blur();
    await page.waitForTimeout(600);
  }
  compare(
    "每车材料 / 剩余车数一致",
    await readState(legacyPage, "legacy"),
    await readState(nextPage, "next"),
  );

  console.log("\n[D] 关闭「世界9」");
  for (const [page] of [
    [legacyPage],
    [nextPage],
  ]) {
    // 原版是 checkbox，新版是 toggle 按钮：click() 对两者都是「切换」
    await page.locator("#world-level-9").click();
    await page.waitForTimeout(600);
  }
  compare(
    "关闭世界9 后数值一致",
    await readState(legacyPage, "legacy"),
    await readState(nextPage, "next"),
  );

  console.log("\n[E] 切换加成角色为多莉");
  for (const [page] of [
    [legacyPage],
    [nextPage],
  ]) {
    await page.locator("#dori-bonus").check();
    await page.waitForTimeout(600);
  }
  compare(
    "多莉加成下数值一致",
    await readState(legacyPage, "legacy"),
    await readState(nextPage, "next"),
  );

  console.log("\n[F] 切换到下一个材料");
  for (const [page, kind] of [
    [legacyPage, "legacy"],
    [nextPage, "next"],
  ]) {
    await page.locator(kind === "legacy" ? ".next-material" : '[aria-label="下一个材料"]').click();
    await page.waitForTimeout(400);
  }
  compare(
    "切换材料后数值一致",
    await readState(legacyPage, "legacy"),
    await readState(nextPage, "next"),
  );

  console.log("\n[G] 清单切到进度降序");
  for (const [page, kind] of [
    [legacyPage, "legacy"],
    [nextPage, "next"],
  ]) {
    await page.locator("#list-sort-progress").check();
    await page.locator("#list-order-desecnding, #list-order-descending").first().check();
    await page.waitForTimeout(400);
  }
  const legacyList = await readState(legacyPage, "legacy");
  const nextList = await readState(nextPage, "next");
  compare("进度降序时行数一致", { listRows: legacyList.listRows }, { listRows: nextList.listRows });
} finally {
  await browser.close();
}

console.log(
  `\n${failures.length === 0 ? "行为完全一致 ✅" : `${failures.length} 处差异 ❌`}`,
);
process.exit(failures.length === 0 ? 0 : 1);
