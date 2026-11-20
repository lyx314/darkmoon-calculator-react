/**
 * 生成文档截图：宽屏双栏 + 移动端单栏，都带一份演示数据。
 *
 *   pnpm build && pnpm preview --port 4173
 *   node scripts/shot-layout.mjs
 */
import { chromium } from "playwright-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const URL = process.argv[2] ?? "http://localhost:4173/";

const browser = await chromium.launch({ executablePath: EDGE, headless: true });

async function fillDemo(page) {
  for (const [label, value] of [
    ["史莱姆原浆 数量", "12"],
    ["史莱姆清 数量", "30"],
    ["史莱姆凝液 数量", "200"],
  ]) {
    // 清单里也有同名输入框，这里要精确匹配顶部面板那个
    const input = page.getByLabel(label, { exact: true });
    await input.fill(value);
    await input.blur();
  }
  const enemy = page.getByLabel("敌人数量").first();
  await enemy.fill("20");
  await enemy.blur();
}

async function capture({ width, height, file, fullPage }) {
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 2,
  });
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.getByTestId("progress-value").waitFor();
  await fillDemo(page);

  // 列表图片是 loading="lazy"：整页截图不会滚动，标题以下的图会缺，
  // 所以截图前强制全部加载完，避免文档图出现空白格子。
  await page.evaluate(async () => {
    const images = [...document.images];
    images.forEach((img) => {
      img.loading = "eager";
    });
    await Promise.all(
      images.map((img) =>
        img.complete
          ? null
          : new Promise((resolve) => {
              img.addEventListener("load", resolve, { once: true });
              img.addEventListener("error", resolve, { once: true });
            }),
      ),
    );
  });

  await page.waitForTimeout(500);
  await page.screenshot({ path: file, fullPage });

  const layout = await page.evaluate(() => {
    const main = document.querySelector("main");
    const list = document.querySelector('[data-testid="list-row"]')?.parentElement;
    return {
      mainWidth: Math.round(main.getBoundingClientRect().width),
      columns: getComputedStyle(main).flexDirection === "row" ? 2 : 1,
      listScrolls: list ? list.scrollHeight > list.clientHeight + 4 : false,
      overflowX: document.body.scrollWidth > window.innerWidth,
    };
  });
  console.log(`${file} ${JSON.stringify(layout)}`);
  await page.close();
}

await capture({ width: 1280, height: 900, file: "docs/desktop.png", fullPage: false });
await capture({ width: 390, height: 844, file: "docs/mobile.png", fullPage: true });

await browser.close();
