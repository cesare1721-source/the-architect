/**
 * Lista los datos PENDIENTES de la tienda.
 *   pnpm check:data            → informa (siempre sale con 0)
 *   pnpm check:data --strict   → falla si el WhatsApp sigue PENDIENTE (antes de publicar)
 */
import { products } from "../src/data/products";
import { store } from "../src/data/store";

const strict = process.argv.includes("--strict");
const total = products.length;
const noPrice = products.filter((p) => p.price === null).length;
const noSizes = products.filter((p) => p.sizes.length === 0).length;
const rows: [string, string, boolean][] = [
  ["WhatsApp", store.whatsapp === "PENDIENTE" ? "PENDIENTE" : `+${store.whatsapp}`, store.whatsapp === "PENDIENTE"],
  ["Instagram", store.instagram ? `@${store.instagram}` : "—", store.instagram === null],
  ["Envíos", store.shipping ?? "—", store.shipping === null],
  ["Productos sin precio", `${noPrice}/${total}`, noPrice > 0],
  ["Productos sin tallas", `${noSizes}/${total}`, noSizes > 0],
];
const pending = rows.filter((r) => r[2]).length;
console.log(`\nHOOPZ · datos de la tienda (${pending} pendiente${pending === 1 ? "" : "s"})`);
for (const [label, value, isPending] of rows) console.log(`  ${isPending ? "⚠" : "✓"} ${label.padEnd(22)} ${value}`);
console.log("");
if (strict && store.whatsapp === "PENDIENTE") {
  console.error("✗ No se puede publicar: falta el número de WhatsApp en src/data/store.ts\n");
  process.exit(1);
}
