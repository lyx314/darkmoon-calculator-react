import { COLOR_THEMES, THEME_LABELS } from "../domain/themes";
import type { ColorTheme } from "../domain/types";
import {
  useColorTheme,
  useDarkmoonActions,
  useIsWorldLevel9,
} from "../store/selectors";
import { selectLike, textButton } from "./ui/buttonStyles";

export function NavBar() {
  const colorTheme = useColorTheme();
  const isWorldLevel9 = useIsWorldLevel9();
  const { setWorldLevel9, setColorTheme, clearAll } = useDarkmoonActions();

  const handleClear = () => {
    if (window.confirm("确定要清除所有数据吗？")) {
      clearAll();
    }
  };

  return (
    <nav className="mx-auto flex max-w-[920px] items-center gap-[5px] px-[10px] py-[10px] text-[13px] font-semibold">
      <button type="button" className={textButton.primary} onClick={handleClear}>
        清除
      </button>

      <select
        id="color-theme"
        aria-label="配色主题"
        value={colorTheme}
        onChange={(event) => setColorTheme(event.target.value as ColorTheme)}
        className={`${selectLike} w-[68px]`}
      >
        {COLOR_THEMES.map((theme) => (
          <option key={theme} value={theme}>
            {THEME_LABELS[theme]}
          </option>
        ))}
      </select>

      <button
        type="button"
        id="world-level-9"
        aria-pressed={isWorldLevel9}
        title={
          isWorldLevel9
            ? "当前：世界等级 9（点击切换）"
            : "当前：普通世界等级（点击切换）"
        }
        onClick={() => setWorldLevel9(!isWorldLevel9)}
        className={isWorldLevel9 ? textButton.primary : textButton.outline}
      >
        世界9
      </button>
    </nav>
  );
}
