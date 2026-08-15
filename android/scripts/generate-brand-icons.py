from PIL import Image
from pathlib import Path

src = Path(r"D:\fitconnect\apps\web\public\brand\fitconnect-logo-1024.png")
app_res = Path(r"D:\fitconnect\android\app\src\main\res")
img = Image.open(src).convert("RGBA")

densities = {
    "mdpi": 108,
    "hdpi": 162,
    "xhdpi": 216,
    "xxhdpi": 324,
    "xxxhdpi": 432,
}


def make_fg(size: int) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    pad = int(size * 0.18)
    target = size - 2 * pad
    mark = img.copy()
    mark.thumbnail((target, target), Image.Resampling.LANCZOS)
    x = (size - mark.width) // 2
    y = (size - mark.height) // 2
    canvas.paste(mark, (x, y), mark)
    return canvas


for dens, size in densities.items():
    d = app_res / f"mipmap-{dens}"
    d.mkdir(parents=True, exist_ok=True)
    make_fg(size).save(d / "ic_launcher_foreground.png", optimize=True)
    legacy = Image.new("RGBA", (size, size), (7, 11, 20, 255))
    mark = img.copy()
    inset = int(size * 0.12)
    mark.thumbnail((size - 2 * inset, size - 2 * inset), Image.Resampling.LANCZOS)
    lx = (size - mark.width) // 2
    ly = (size - mark.height) // 2
    legacy.paste(mark, (lx, ly), mark)
    legacy.save(d / "ic_launcher.png", optimize=True)
    legacy.save(d / "ic_launcher_round.png", optimize=True)

xx = app_res / "drawable-xxhdpi"
xx.mkdir(parents=True, exist_ok=True)
mark512 = img.copy()
mark512.thumbnail((512, 512), Image.Resampling.LANCZOS)
mark512.save(xx / "ic_fitconnect_brand.png", optimize=True)
print("generated", list(densities.keys()))
