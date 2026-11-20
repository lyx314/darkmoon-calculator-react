import { COLOR_THEMES, THEME_LABELS } from "../domain/themes";
import type { ColorTheme } from "../domain/types";
import {
  useColorTheme,
  useDarkmoonActions,
  useIsWorldLevel9,
} from "../store/selectors";
import { textButton } from "./ui/buttonStyles";
import { Select } from "./ui/Select";

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
    <nav className="mx-auto flex w-full max-w-[920px] shrink-0 items-center gap-[5px] px-[10px] py-[10px] text-[13px] font-semibold">
      <button type="button" className={textButton.primary} onClick={handleClear}>
        清除
      </button>

      <Select
        id="color-theme"
        aria-label="配色主题"
        variant="primary"
        value={colorTheme}
        onChange={(event) => setColorTheme(event.target.value as ColorTheme)}
        className="w-[76px]"
      >
        {COLOR_THEMES.map((theme) => (
          <option key={theme} value={theme}>
            {THEME_LABELS[theme]}
          </option>
        ))}
      </Select>

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
