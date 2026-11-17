"""Hoja de contacto de los recortes sobre el fondo del sitio. Uso: python3 scripts/contact-sheet.py"""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
files = sorted((ROOT / "src" / "assets" / "products").glob("*.png"))
TW, TH, COLS = 240, 300, 8
sheet = Image.new("RGBA", (COLS * TW, -(-len(files) // COLS) * TH), (8, 8, 10, 255))
for i, f in enumerate(files):
    im = Image.open(f).convert("RGBA")
    im.thumbnail((TW - 8, TH - 8))
    sheet.alpha_composite(im, ((i % COLS) * TW + 4, (i // COLS) * TH + 4))
out = ROOT / "tmp" / "contact-sheet.png"
out.parent.mkdir(exist_ok=True)
sheet.save(out)
print(f"{len(files)} recortes → {out}")
