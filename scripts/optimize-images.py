"""把 public/img 下的素材统一压缩成 160px 的 WebP。

素材原图是 256×256 的 PNG（平均 16.7 KB），但页面上最大只显示 80px
（2 倍屏也只要 160px），所以缩到 160 并转 WebP 可以省掉约七成体积。

用法（需要 Pillow）：
    python scripts/optimize-images.py [目录]

已经有同名 .webp 的会跳过，方便以后只处理新增素材。
"""

import sys
from pathlib import Path

from PIL import Image

SIZE = 160
QUALITY = 82

target = Path(sys.argv[1] if len(sys.argv) > 1 else "public/img")
pngs = sorted(target.glob("*.png"))
if not pngs:
    print(f"{target} 下没有 PNG")
    sys.exit(0)

before = after = 0
converted = 0

for png in pngs:
    webp = png.with_suffix(".webp")
    if webp.exists():
        continue

    image = Image.open(png).convert("RGBA")
    image = image.resize((SIZE, SIZE), Image.LANCZOS)
    image.save(webp, "WEBP", quality=QUALITY, method=6)

    before += png.stat().st_size
    after += webp.stat().st_size
    converted += 1


print(f"转换 {converted} 张：{before / 1024:.0f} KB -> {after / 1024:.0f} KB "
      f"（省 {(1 - after / before) * 100:.0f}%）")
