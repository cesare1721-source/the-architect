/**
 * Recursos de marca e imágenes para compartir:
 *   1. Recortes del logo (src/assets/brand/hoopz-{wordmark,emblem,emblem-mask}.png) y favicons → sharp
 *   2. Imágenes OG 1200×630 por producto (public/og/<slug>.jpg) y la general (default.jpg)
 *      → Chromium vía Playwright (librsvg ignora las fuentes web)
 *
 * Todo se cachea por fecha: si las salidas están al día no se hace nada, así que el build de
 * Cloudflare (sin navegador) no necesita Chromium. Las salidas se versionan en git.
 * Forzar: tsx scripts/make-og.ts --force
 */
import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import sharp, { type Region } from "sharp";
import { products } from "../src/data/products";
import type { Product } from "../src/data/schema";

const ROOT = resolve(import.meta.dirname, "..");
const r = (p: string) => resolve(ROOT, p);
const FORCE = process.argv.includes("--force");
const LOGO = r("src/assets/brand/hoopz-logo.png");
const SELF = import.meta.filename;

const mtime = (p: string) => (existsSync(p) ? statSync(p).mtimeMs : 0);
const stale = (out: string, inputs: string[]) => FORCE || !existsSync(out) || inputs.some((i) => mtime(i) > mtime(out));

// ── 1. Marca y favicons ──────────────────────────────────────────────
const EMBLEM_CROP: Region = { left: 110, top: 140, width: 805, height: 740 };
const BALL_CROP: Region = { left: 362, top: 138, width: 300, height: 300 };
const BRAND: { out: string; crop: Region; size?: number }[] = [
  { out: "src/assets/brand/hoopz-wordmark.png", crop: { left: 130, top: 575, width: 762, height: 285 } },
  { out: "src/assets/brand/hoopz-emblem.png", crop: EMBLEM_CROP },
  { out: "public/favicon.png", crop: BALL_CROP, size: 48 },
  { out: "public/apple-touch-icon.png", crop: BALL_CROP, size: 180 },
];

async function brand() {
  for (const b of BRAND) {
    const out = r(b.out);
    if (!stale(out, [LOGO, SELF])) continue;
    let img = sharp(LOGO).extract(b.crop);
    if (b.size) img = img.resize(b.size, b.size);
    await img.png().toFile(out);
    console.log(`  ✓ ${b.out}`);
  }
  // Emblema blanco con alfa = luminancia: máscara para el barrido de luz con la forma del logo
  const mask = r("src/assets/brand/hoopz-emblem-mask.png");
  if (stale(mask, [LOGO, SELF])) {
    const { width, height } = EMBLEM_CROP;
    const alpha = await sharp(LOGO).extract(EMBLEM_CROP).greyscale().linear(1.6, -40).toColourspace("b-w").raw().toBuffer();
    await sharp({ create: { width, height, channels: 3, background: "#ffffff" } })
      .joinChannel(alpha, { raw: { width, height, channels: 1 } })
      .png()
      .toFile(mask);
    console.log("  ✓ src/assets/brand/hoopz-emblem-mask.png");
  }
}

// ── 2. Imágenes OG ───────────────────────────────────────────────────
const stageImage = (p: Product) => (p.images.back ?? p.images.front)!;
const cutout = (name: string) => r(`src/assets/products/${name}.png`);
const fileUrl = (p: string) => pathToFileURL(p).href;
const FONT_DISPLAY = r("node_modules/@fontsource-variable/big-shoulders-display/files/big-shoulders-display-latin-wght-normal.woff2");
const FONT_SANS = r("node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2");
const EMBLEM = r("src/assets/brand/hoopz-emblem.png");
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const FADE = "-webkit-mask-image:linear-gradient(to right,transparent,#000 8%,#000 92%,transparent),linear-gradient(to bottom,transparent,#000 8%,#000 92%,transparent);-webkit-mask-composite:source-in";

function shell(body: string, accent: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:BS;src:url(${fileUrl(FONT_DISPLAY)}) format("woff2");font-weight:100 900}
@font-face{font-family:MR;src:url(${fileUrl(FONT_SANS)}) format("woff2");font-weight:200 800}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;background:#08080A;color:#F2F2F2;font-family:MR;position:relative;--accent:${accent}}
.wash{position:absolute;inset:0;background:linear-gradient(115deg,transparent 48%,color-mix(in oklch,var(--accent) 55%,#08080A) 48.2%,color-mix(in oklch,var(--accent) 18%,#08080A) 100%)}
.cone{position:absolute;inset:0;background:radial-gradient(ellipse 34% 70% at 76% 6%,rgba(255,255,255,.16),transparent 70%)}
.num{position:absolute;right:30px;top:50%;transform:translateY(-52%);font-family:BS;font-weight:900;line-height:.8;color:transparent;-webkit-text-stroke:3px var(--accent);opacity:.5;white-space:nowrap}
.left{position:absolute;left:64px;top:0;bottom:0;width:540px;display:flex;flex-direction:column;justify-content:center;gap:14px}
.logo{width:250px;margin-left:-18px;${FADE}}
.bug{font-size:16px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:var(--accent)}
h1{font-family:BS;font-weight:900;font-size:84px;line-height:.9;letter-spacing:-.01em;text-transform:uppercase}
.sub{font-size:26px;color:#A3A3AD;font-weight:600}
.pill{align-self:flex-start;margin-top:10px;background:#25D366;color:#08080A;font-weight:800;font-size:24px;padding:12px 26px;border-radius:999px}
.g{position:absolute;filter:drop-shadow(0 30px 30px rgba(0,0,0,.65))}
.grain{position:absolute;inset:0;opacity:.06;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
</style></head><body><div class="wash"></div><div class="cone"></div>${body}<div class="grain"></div></body></html>`;
}

function productHtml(p: Product) {
  const jersey = p.category === "actuales" || p.category === "retro";
  const bug = jersey ? (p.category === "retro" ? "Leyenda" : p.team!.split(" ").at(-1)) : p.category === "chaquetas" ? "Chaqueta" : "Entrenamiento";
  const big = p.number ?? p.plate.split(" ")[0]!;
  const heading = jersey ? `${esc(p.title)}${p.number !== null ? ` <span style="color:var(--accent)">#${p.number}</span>` : ""}` : esc(p.title);
  const sub = [p.season ? `Temporada ${p.season}` : null, p.variant].filter(Boolean).join(" · ");
  return shell(
    `<div class="num" style="font-size:${big.length > 3 ? 260 : 520}px">${esc(big)}</div>
     <img class="g" src="${fileUrl(cutout(stageImage(p)))}" style="height:600px;right:60px;top:22px">
     <div class="left">
       <img class="logo" src="${fileUrl(EMBLEM)}">
       <p class="bug">${esc(bug ?? "")}</p>
       <h1>${heading}</h1>
       <p class="sub">${esc(sub)}</p>
       <span class="pill">Pide por WhatsApp</span>
     </div>`,
    p.accent,
  );
}

function defaultHtml(feat: Product[]) {
  const pos = [
    { right: 420, rot: -12, h: 420, top: 150 },
    { right: 20, rot: 12, h: 420, top: 150 },
    { right: 300, rot: -5, h: 500, top: 80 },
    { right: 120, rot: 5, h: 500, top: 80 },
    { right: 200, rot: 0, h: 590, top: 30 },
  ];
  const imgs = feat
    .map((p, i) => `<img class="g" src="${fileUrl(cutout(stageImage(p)))}" style="height:${pos[i]!.h}px;right:${pos[i]!.right}px;top:${pos[i]!.top}px;transform:rotate(${pos[i]!.rot}deg)">`)
    .join("");
  return shell(
    `${imgs}<div class="left" style="width:470px">
       <img class="logo" src="${fileUrl(EMBLEM)}" style="width:300px">
       <h1 style="font-size:70px">Viste el juego</h1>
       <p class="sub">Jerseys NBA actuales y leyendas · Aragua, Venezuela · Pedidos por WhatsApp</p>
     </div>`,
    "#C8C8CC",
  );
}

async function og() {
  mkdirSync(r("public/og"), { recursive: true });
  const DATA = r("src/data/products.ts");
  const feat = products.filter((p) => p.lineup !== null).sort((a, b) => a.lineup! - b.lineup!);
  // orden de pintado: atrás → adelante; el titular 1 va al centro
  const fan = [feat[3]!, feat[4]!, feat[1]!, feat[2]!, feat[0]!];
  const jobs = [
    ...products.map((p) => ({ out: r(`public/og/${p.slug}.jpg`), html: () => productHtml(p), inputs: [cutout(stageImage(p)), DATA, EMBLEM, SELF] })),
    { out: r("public/og/default.jpg"), html: () => defaultHtml(fan), inputs: [...feat.map((p) => cutout(stageImage(p))), DATA, EMBLEM, SELF] },
  ];
  const todo = jobs.filter((j) => stale(j.out, j.inputs));
  if (!todo.length) return console.log("  ✓ imágenes OG al día");
  if (todo.flatMap((j) => j.inputs).some((i) => !existsSync(i))) return console.warn("  ⚠ Faltan recortes: no se generan imágenes OG (ejecuta pnpm images).");

  let chromium;
  try {
    ({ chromium } = await import("@playwright/test"));
  } catch {
    return console.warn("  ⚠ Playwright no disponible: se usan las imágenes OG versionadas.");
  }
  let browser;
  try {
    browser = await chromium.launch();
  } catch (e) {
    return console.warn(`  ⚠ No se pudo abrir Chromium (${(e as Error).message.split("\n")[0]}); se usan las OG versionadas.`);
  }
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  mkdirSync(r("tmp"), { recursive: true });
  const tmpHtml = r("tmp/og.html");
  for (const j of todo) {
    writeFileSync(tmpHtml, j.html());
    await page.goto(fileUrl(tmpHtml), { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await sharp(await page.screenshot({ type: "png" })).jpeg({ quality: 82, mozjpeg: true }).toFile(j.out);
    console.log(`  ✓ ${j.out.replace(ROOT + "/", "")}`);
  }
  await browser.close();
}

console.log("Marca, favicons e imágenes OG…");
await brand();
await og();
