import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { countsByCategory, getProducts, lineup } from "@/lib/catalog";

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
};

describe("catálogo", () => {
  it("conteos por categoría", () => expect(countsByCategory()).toEqual({ todo: 19, actuales: 9, retro: 3, chaquetas: 2, entrenamiento: 5 }));
  it("alineación titular en orden", () =>
    expect(lineup().map((p) => p.slug)).toEqual(["lakers-bryant-24", "heat-butler-22", "celtics-bird-33", "lakers-james-23", "bulls-rodman-91"]));
  it("acentos con contraste ≥ 4.5:1 sobre el fondo", () => {
    for (const p of getProducts()) expect(contrast(p.accent, "#08080A"), p.slug).toBeGreaterThanOrEqual(4.5);
  });
  it("placas cortas para el casillero", () => {
    for (const p of getProducts()) expect(p.plate.length, p.slug).toBeLessThanOrEqual(11);
  });
  it("todas las imágenes existen", () => {
    for (const p of getProducts())
      for (const name of [p.images.front, p.images.back].filter(Boolean)) expect(existsSync(`src/assets/products/${name}.png`), `${name}.png`).toBe(true);
  });
});
