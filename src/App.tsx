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
        {/* 左：录入与统计，宽屏下自己滚动（隐藏滚动条，靠滚轮/键盘滚动） */}
        <div className="scroll-hidden min-w-0 min-[860px]:w-[430px] min-[860px]:shrink-0 min-[860px]:overflow-y-auto min-[860px]:pr-[6px]">
          <div className="flex items-end justify-between">
            <h1 className="my-[10px] mr-[10px] text-[13px] font-semibold">
              DARKMOON CALCULATOR
            </h1>
            <img
              src={MASCOT_IMAGE.title}
              alt="绮良良超级可爱表情包"
              className="w-[40px]"
            />
          </div>

          <MaterialPanel />
          <EnemySection />
          <CraftSection />
        </div>

        {/* 右：材料一览，宽屏下自己滚动 */}
        <aside className="min-h-0 min-w-0 min-[860px]:flex-1">
          <MaterialList />
        </aside>
      </main>
    </div>
  );
}
