/** 用同一视口给原版页面截图，用于和新版做视觉对比 */
import { chromium } from "playwright-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const URL = process.argv[2] ?? "http://127.0.0.1:4174/";
const OUT = process.argv[3] ?? "docs/reference-original.png";

const browser = await chromium.launch({ executablePath: EDGE, headless: true });
const context = await browser.newContext({
  viewport: { width: 420, height: 1400 },
  deviceScaleFactor: 2,
});
const page = await context.newPage();
await page.goto(URL, { waitUntil: "networkidle" });
// 等待 ionicons 自定义元素渲染完成
await page.waitForTimeout(1500);
await page.screenshot({ path: OUT, fullPage: true });
const height = await page.evaluate(() => document.body.scrollHeight);
console.log(`saved ${OUT}, body height=${height}`);
await browser.close();
