"""把 public/img 里的素材改成按物品 key 命名。

旧命名：`<materialId>-<tier>.webp`（如 `1-2.webp`），语义不明且与数组下标耦合。
新命名：`materials/<kebab-case(key)>.webp`（如 `materials/slime-concentrate.webp`）。

吉祥物同时改成带用途的名字：
    kirara1.webp -> kirara-title.webp    （标题旁）
    kirara2.webp -> kirara-list.webp     （材料一览标题旁）
    kirara3.webp -> kirara-favicon.webp  （站点图标）

用法：
    python scripts/rename-material-images.py
"""

import json
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / "public" / "img"
DATA = ROOT / "scripts" / "raw-data.json"

MASCOTS = {
    "kirara1.webp": "kirara-title.webp",
    "kirara2.webp": "kirara-list.webp",
    "kirara3.webp": "kirara-favicon.webp",
}


def kebab(key: str) -> str:
    """与 src/domain/materialImage.ts 的 toImageFileName 规则一致。"""
    step1 = re.sub(r"([a-z0-9])([A-Z])", r"\1-\2", key)
    step2 = re.sub(r"([A-Z]+)([A-Z][a-z])", r"\1-\2", step1)
    return step2.lower()


def main() -> None:
    if not DATA.exists():
        sys.exit(f"找不到 {DATA}，先跑 scripts/extract-data.mjs")

    materials = json.loads(DATA.read_text(encoding="utf-8"))["materials"]
    target = IMG / "materials"
    target.mkdir(exist_ok=True)

    moved = 0
    missing = []

    for material in materials:
        for tier, key in enumerate(material["keys"]):
            source = IMG / f"{material['id']}-{tier}.webp"
            destination = target / f"{kebab(key)}.webp"

            if destination.exists():
                continue
            if not source.exists():
                missing.append(source.name)
                continue

            shutil.move(str(source), str(destination))
            moved += 1

    for old, new in MASCOTS.items():
        source = IMG / old
        if source.exists():
            shutil.move(str(source), str(IMG / new))
            moved += 1

    print(f"重命名 {moved} 个文件，输出目录 {target.relative_to(ROOT)}")
    if missing:
        print(f"缺少 {len(missing)} 个源文件：{missing[:5]}")


if __name__ == "__main__":
    main()
