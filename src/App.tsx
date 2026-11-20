import { useEffect } from "react";

import { CraftSection } from "./components/CraftSection";
import { EnemySection } from "./components/EnemySection";
import { MaterialList } from "./components/MaterialList";
import { MaterialPanel } from "./components/MaterialPanel";
import { NavBar } from "./components/NavBar";
import { MASCOT_IMAGE } from "./domain/materialImage";
import { useColorTheme } from "./store/selectors";

export default function App() {
  const colorTheme = useColorTheme();

  // 主题写到 <html data-theme>，Tailwind 的 CSS 变量据此切换
  useEffect(() => {
    document.documentElement.dataset.theme = colorTheme;
  }, [colorTheme]);

  return (
    /*
      应用外壳：宽屏下整页固定为视口高度，页面本身不滚动，
      左栏和右栏各自内部滚动，互不牵连。
      窄屏（< 860px）退回普通文档流，仍由页面统一滚动。
    */
    <div className="flex min-h-screen flex-col min-[860px]:h-screen min-[860px]:overflow-hidden">
      <NavBar />

      <main className="mx-auto flex min-h-0 w-full max-w-[920px] flex-col gap-[16px] px-[10px] pb-[20px] min-[860px]:flex-1 min-[860px]:flex-row min-[860px]:pb-[10px]">
        {/* 左：录入与统计。宽屏下与右侧同构：表头固定，只有下面的内容滚 */}
        <div className="flex min-w-0 flex-col min-[860px]:min-h-0 min-[860px]:w-[430px] min-[860px]:shrink-0">
          {/*
            表头结构与右侧「材料一览」的 h2 保持一致（同样的内边距、下划线、40px 图标），
            这样两侧的下划线在同一条水平线上，下面的面板和列表也从同一 Y 开始。
          */}
          <header className="flex shrink-0 items-end justify-between border-b-2 border-c9 p-[5px]">
            <h1 className="text-[13px] font-semibold">DARKMOON CALCULATOR</h1>
            <img
              src={MASCOT_IMAGE.title}
              alt="绮良良超级可爱表情包"
              className="w-[40px] translate-y-[15%]"
            />
          </header>

          {/* 滚动条隐藏，靠滚轮 / 触控板 / 键盘滚动 */}
          <div className="scroll-hidden min-h-0 min-[860px]:flex-1 min-[860px]:overflow-y-auto min-[860px]:pr-[6px]">
            <MaterialPanel />
            <EnemySection />
            <CraftSection />
          </div>
        </div>

        {/* 右：材料一览，宽屏下自己滚动 */}
        <aside className="min-h-0 min-w-0 min-[860px]:flex-1">
          <MaterialList />
        </aside>
      </main>
    </div>
  );
}
