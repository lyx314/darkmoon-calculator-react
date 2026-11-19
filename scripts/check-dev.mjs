// 快速验证 dev server 是否正常渲染
import { chromium } from "playwright-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const url = process.argv[2] ?? "http://localhost:5179/";

const browser = await chromium.launch({ executablePath: EDGE, headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});

await page.goto(url, { waitUntil: "networkidle" });
await page.getByTestId("progress-value").waitFor({ timeout: 20000 });

const rows = await page.locator('[data-testid="list-row"]').count();
const bg = await page.evaluate(() =>
  getComputedStyle(document.querySelector("section")).backgroundColor,
);
console.log(`url=${url}`);
console.log(`list rows=${rows}`);
console.log(`section background=${bg}  (Tailwind 主题变量生效)`);
console.log(`errors=${errors.length ? errors.join(" | ") : "none"}`);

await browser.close();
process.exit(rows === 53 && errors.length === 0 ? 0 : 1);
