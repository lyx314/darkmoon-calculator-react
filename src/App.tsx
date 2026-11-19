import { useEffect } from "react";

import { CraftSection } from "./components/CraftSection";
import { EnemySection } from "./components/EnemySection";
import { MaterialList } from "./components/MaterialList";
import { MaterialPanel } from "./components/MaterialPanel";
import { NavBar } from "./components/NavBar";
import { useColorTheme } from "./store/selectors";

export default function App() {
  const colorTheme = useColorTheme();

  // 主题写到 <html data-theme>，Tailwind 的 CSS 变量据此切换
  useEffect(() => {
    document.documentElement.dataset.theme = colorTheme;
  }, [colorTheme]);

  return (
    <>
      <NavBar />

      {/*
        宽屏（>= 860px）左右分栏：左边是录入与统计面板，右边是材料一览。
        窄屏自动退回单列，顺序仍是「面板 -> 列表」。
      */}
      <main className="mx-auto flex max-w-[920px] flex-col gap-[16px] px-[10px] pb-[20px] min-[860px]:flex-row min-[860px]:items-start">
        <div className="min-w-0 min-[860px]:w-[430px] min-[860px]:shrink-0">
          <div className="flex items-end justify-between">
            <h1 className="my-[10px] mr-[10px] text-[12px] font-semibold">
              DARKMOON CALCULATOR
            </h1>
            <img
              src="img/kirara1.webp"
              alt="绮良良超级可爱表情包"
              className="w-[40px]"
            />
          </div>

          <MaterialPanel />
          <EnemySection />
          <CraftSection />
        </div>

        <aside className="min-w-0 min-[860px]:sticky min-[860px]:top-0 min-[860px]:h-[calc(100vh-10px)] min-[860px]:flex-1">
          <MaterialList />
        </aside>
      </main>
    </>
  );
}
