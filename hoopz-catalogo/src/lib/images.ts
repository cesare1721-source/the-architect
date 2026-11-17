import type { ImageMetadata } from "astro";

const files = import.meta.glob<{ default: ImageMetadata }>("/src/assets/products/*.png", { eager: true });

/** Recorte `src/assets/products/<name>.png`, o falla el build con un mensaje claro. */
export function productImage(name: string): ImageMetadata {
  const mod = files[`/src/assets/products/${name}.png`];
  if (!mod) throw new Error(`Falta la imagen src/assets/products/${name}.png (ejecuta pnpm images)`);
  return mod.default;
}
