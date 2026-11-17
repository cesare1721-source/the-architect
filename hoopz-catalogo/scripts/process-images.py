"""Recorta el fondo de las fotos de producto.

Uso:
  python3 scripts/process-images.py                          # todas
  python3 scripts/process-images.py heat-butler-22-frente    # solo esas (nombre sin extensión)
  python3 scripts/process-images.py --model isnet-general-use <nombre>

Entrada:  assets-src/fotos/<nombre>.jpg
Salida:   src/assets/products/<nombre>.png  (lienzo 4:5, 1280 × 1600, fondo transparente)

Requiere: pip install "rembg[cpu]" pillow   (trae numpy y scipy)
Solo se calcula el canal alfa: los colores de la prenda no se tocan.
"""

import argparse
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps
from rembg import new_session, remove
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets-src" / "fotos"
OUT = ROOT / "src" / "assets" / "products"

OUT_W, OUT_H = 1280, 1600  # 4:5
PAD = 0.06  # margen transparente
BASELINE = 0.94  # todas las prendas "pisan" la misma línea
ALPHA_MIN = 16


def keep_garment(alpha: np.ndarray) -> np.ndarray:
    """Se queda con la mancha más grande (la prenda) y rellena sus huecos internos."""
    mask = alpha > ALPHA_MIN
    labels, n = ndimage.label(mask, structure=np.ones((3, 3)))
    if n > 1:
        sizes = ndimage.sum(mask, labels, range(1, n + 1))
        mask = labels == (1 + int(np.argmax(sizes)))
    filled = ndimage.binary_fill_holes(mask)
    out = np.where(filled, alpha, 0).astype(np.uint8)
    out[filled & (alpha <= ALPHA_MIN)] = 255
    return out


def process(name: str, session, fg: int, bg: int) -> None:
    im = ImageOps.exif_transpose(Image.open(SRC / f"{name}.jpg")).convert("RGB")
    cut = remove(
        im,
        session=session,
        alpha_matting=True,
        alpha_matting_foreground_threshold=fg,
        alpha_matting_background_threshold=bg,
        alpha_matting_erode_size=8,
    ).convert("RGBA")
    alpha = Image.fromarray(keep_garment(np.array(cut)[:, :, 3]))
    result = im.convert("RGBA")
    result.putalpha(alpha)

    bbox = alpha.point(lambda a: 255 if a > ALPHA_MIN else 0).getbbox()
    if not bbox:
        print(f"  ✗ {name}: no se detectó la prenda", file=sys.stderr)
        sys.exit(1)
    garment = result.crop(bbox)
    scale = min(OUT_W * (1 - 2 * PAD) / garment.width, OUT_H * (BASELINE - PAD) / garment.height)
    garment = garment.resize((round(garment.width * scale), round(garment.height * scale)), Image.LANCZOS)

    canvas = Image.new("RGBA", (OUT_W, OUT_H), (0, 0, 0, 0))
    canvas.alpha_composite(garment, ((OUT_W - garment.width) // 2, round(OUT_H * BASELINE) - garment.height))
    OUT.mkdir(parents=True, exist_ok=True)
    canvas.save(OUT / f"{name}.png", optimize=True)
    print(f"  ✓ {name}", flush=True)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("names", nargs="*", help="nombres sin extensión; vacío = todas")
    ap.add_argument("--model", default="birefnet-general")
    ap.add_argument("--fg", type=int, default=240)
    ap.add_argument("--bg", type=int, default=10)
    args = ap.parse_args()

    names = args.names or sorted(p.stem for p in SRC.glob("*.jpg"))
    if len(names) > 1:
        # un subproceso por foto: el alpha matting acumula memoria si se reutiliza el proceso
        print(f"Procesando {len(names)} fotos con {args.model}…", flush=True)
        flags = ["--model", args.model, "--fg", str(args.fg), "--bg", str(args.bg)]
        failed = [n for n in names if subprocess.run([sys.executable, __file__, n, *flags]).returncode != 0]
        if failed:
            sys.exit("Fallaron: " + ", ".join(failed))
        return
    try:
        session = new_session(args.model)
    except Exception as e:
        print(f"Modelo {args.model} no disponible ({e}); uso isnet-general-use", file=sys.stderr)
        session = new_session("isnet-general-use")
    process(names[0], session, args.fg, args.bg)


if __name__ == "__main__":
    main()
