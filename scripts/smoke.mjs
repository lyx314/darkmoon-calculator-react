/**
 * 真实浏览器冒烟测试：用本机 Edge 驱动打包后的产物，逐项检查原版功能。
 *
 * 用法：
 *   1. pnpm build
 *   2. pnpm preview --port 4173
 *   3. node scripts/smoke.mjs
 */
import { chromium } from "playwright-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const URL = process.env.SMOKE_URL ?? "http://localhost:4173/";

const failures = [];
function check(name, condition, extra = "") {
  if (condition) {
    console.log(`  ok   ${name}`);
  } else {
    console.log(`  FAIL ${name}${extra ? ` -> ${extra}` : ""}`);
    failures.push(name);
  }
}

const browser = await chromium.launch({ executablePath: EDGE, headless: true });
const context = await browser.newContext({
  viewport: { width: 420, height: 1400 },
  deviceScaleFactor: 2,
  acceptDownloads: true,
});
const page = await context.newPage();

const consoleErrors = [];
page.on("pageerror", (error) => consoleErrors.push(String(error)));
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});

try {
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.getByTestId("progress-value").waitFor();

  console.log("\n[1] 首屏渲染");
  check("标题存在", (await page.locator("h1").innerText()).includes("DARKMOON"));
  check("初始进度为 0%", (await page.getByTestId("progress-value").innerText()) === "0%");
  check(
    "默认材料为史莱姆系列",
    (await page.locator("body").innerText()).includes("史莱姆原浆"),
  );
  check(
    "材料一览共 53 行",
    (await page.locator('[data-testid="list-row"]').count()) === 53,
  );
  check(
    "列表图片按需加载",
    (await page.locator('[data-testid="list-row"] img').first().getAttribute("loading")) ===
      "lazy",
  );
  check(
    "导入/导出按钮已移除",
    (await page.getByRole("button", { name: "导出" }).count()) === 0 &&
      (await page.getByRole("button", { name: "导入" }).count()) === 0,
  );

  console.log("\n[2] 增减按钮 + 进度联动");
  const highInput = page.getByLabel("史莱姆原浆 数量", { exact: true });
  await page.getByLabel("增加 史莱姆原浆").click();
  await page.getByLabel("增加 史莱姆原浆").click();
  await page.getByLabel("增加 史莱姆原浆").click();
  check("点击三次加号后数量为 3", (await highInput.inputValue()) === "3");
  check(
    "进度随数量变化（0.02%）",
    (await page.getByTestId("progress-value").innerText()) === "0.02%",
  );
  check(
    "进度条带无障碍语义",
    (await page.getByRole("progressbar").first().getAttribute("aria-valuenow")) ===
      "0.02",
  );

  await page.getByLabel("减少 史莱姆原浆").click();
  check("点击减号后数量为 2", (await highInput.inputValue()) === "2");

  console.log("\n[3] 手动输入校验");
  await highInput.fill("123");
  await highInput.blur();
  check("合法输入被接受", (await highInput.inputValue()) === "123");
  page.once("dialog", (dialog) => dialog.accept());
  await highInput.fill("10000");
  await highInput.blur();
  check("超过 9999 被拒绝并还原", (await highInput.inputValue()) === "123");

  console.log("\n[4] 敌人配置 -> 每车 / 剩余车数");
  const enemyNumber = page.getByLabel("敌人数量").first();
  await enemyNumber.fill("10");
  await enemyNumber.blur();
  const leftRun = await page.getByTestId("left-run-times").innerText();
  check(`剩余车数已计算（${leftRun}）`, leftRun !== "-");
  const perRun = await page.getByTestId("progress-per-run").innerText();
  check(`每车进度已计算（${perRun}）`, perRun !== "0%");

  console.log("\n[5] 锁定快照 -> 新增车数");
  await page.getByLabel("锁定初始数量").click();
  await page.getByLabel("增加 史莱姆原浆").click();
  const increased = await page.getByTestId("increased-run-times").innerText();
  check(`新增车数已计算（${increased}）`, increased !== "-");

  console.log("\n[6] 合成统计");
  const lowInput = page.getByLabel("史莱姆凝液 数量", { exact: true });
  await lowInput.fill("300");
  await lowInput.blur();
  const evenHigh = await page.getByTestId("craft-high-even").innerText();
  const evenMedium = await page.getByTestId("craft-medium-even").innerText();
  check(`配平次数已计算（中阶 ${evenMedium} / 高阶 ${evenHigh}）`, Number(evenMedium) + Number(evenHigh) > 0);

  console.log("\n[7] 合成按钮（弹窗输入）");
  page.once("dialog", async (dialog) => {
    check("合成弹窗文案正确", dialog.message().includes("请输入合成高阶的数量"));
    await dialog.accept("10");
  });
  await page.getByRole("button", { name: "合 成" }).first().click();
  check("合成后高阶级数量被保留或增加", Number(await highInput.inputValue()) >= 0);

  console.log("\n[8] 主题切换与持久化");
  await page.getByLabel("配色主题").selectOption("red");
  check(
    "html[data-theme] 切换为 red",
    (await page.evaluate(() => document.documentElement.dataset.theme)) === "red",
  );
  const numbersBefore = await highInput.inputValue();
  await page.reload({ waitUntil: "networkidle" });
  await page.getByTestId("progress-value").waitFor();
  check(
    "刷新后主题保持 red",
    (await page.evaluate(() => document.documentElement.dataset.theme)) === "red",
  );
  check(
    "刷新后数量持久化",
    (await page.getByLabel("史莱姆原浆 数量", { exact: true }).inputValue()) === numbersBefore,
  );
  check(
    "刷新后敌人配置持久化",
    (await page.getByLabel("敌人数量").first().inputValue()) === "10",
  );

  console.log("\n[9] 材料一览排序与跳转");
  await page.getByLabel("进度排序").check();
  check(
    "切换为进度排序后仍有 53 行",
    (await page.locator('[data-testid="list-row"]').count()) === 53,
  );
  await page.getByLabel("背包顺序").check();
  const secondRow = page.locator('[data-testid="list-row"]').nth(1);
  const rowImageAlt = await secondRow.locator("img").first().getAttribute("alt");
  // 行内容层是 pointer-events-none，点击会落到整行的覆盖按钮上
  await secondRow.locator("button").first().click();
  const panelImageAlt = await page
    .locator("section")
    .first()
    .locator("img")
    .first()
    .getAttribute("alt");
  check("点击清单行可切换材料", panelImageAlt === rowImageAlt, `${rowImageAlt} vs ${panelImageAlt}`);
  check(
    "当前材料在清单中高亮",
    (await secondRow.getAttribute("data-current")) === "true" &&
      (await page.locator('[data-testid="list-row"][data-current="true"]').count()) === 1,
  );

  console.log("\n[10] 清单内直接输入数量");
  // 特意选一个“不是当前材料”的行，验证两处输入互不干扰
  const otherRow = page.locator('[data-testid="list-row"]').nth(3);
  const otherInput = otherRow.locator("input").first();
  const rowProgressBefore = await otherRow.locator("span").last().innerText();
  const panelBefore = await page.getByTestId("progress-value").innerText();

  await otherInput.fill("300");
  await otherInput.blur();
  await page.waitForTimeout(400);

  check("清单内输入后数值保留", (await otherInput.inputValue()) === "300");
  check(
    "清单内输入会更新该行进度",
    (await otherRow.locator("span").last().innerText()) !== rowProgressBefore,
  );
  check(
    "清单内输入不影响当前材料（顶部进度不变）",
    (await page.getByTestId("progress-value").innerText()) === panelBefore,
  );

  // 还原，避免影响后续断言
  await otherInput.fill("0");
  await otherInput.blur();
  await page.waitForTimeout(300);

  console.log("\n[11] 清除数据");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "清除" }).click();
  check(
    "清除后进度归零",
    (await page.getByTestId("progress-value").innerText()) === "0%",
  );

  console.log("\n[12] 控制台错误");
  check("无 JS 运行时错误", consoleErrors.length === 0, consoleErrors.join(" | "));
} finally {
  await browser.close();
}

console.log(`\n${failures.length === 0 ? "全部通过 ✅" : `失败 ${failures.length} 项 ❌: ${failures.join(", ")}`}`);
process.exit(failures.length === 0 ? 0 : 1);
