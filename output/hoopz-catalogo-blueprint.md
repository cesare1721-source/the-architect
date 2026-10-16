# HOOPZ Catálogo — Blueprint

> Generado por The Architect el 2026-10-16
> Arquetipo: Marketing / Landing Page (catálogo de productos de una sola página + páginas de producto estáticas)
> Idioma del proyecto y de toda la interfaz: **español (Venezuela)**

---

## 0. Antes de empezar (léelo completo)

Este documento es **autosuficiente**: contiene todo lo necesario para construir el proyecto de cero a publicado, sin preguntar nada.

**Archivos fuente que acompañan este blueprint.** Junto a este archivo existe la carpeta `hoopz-assets/`:

```
hoopz-assets/
  logo/hoopz-logo.png          # logo oficial 1024×1024, fondo negro texturizado (no transparente)
  fotos/<slug>-frente.jpg      # 32 fotos de producto, YA rotadas al derecho y renombradas
  fotos/<slug>-espalda.jpg
```

Cópiala a `assets-src/` en la raíz del proyecto nuevo (Paso 2). Si no la encuentras, es el **único** motivo válido para detenerte y pedírsela al dueño.

**Datos pendientes.** El dueño aún no ha entregado: número de WhatsApp, Instagram, zona de envíos, precios y tallas. **No los inventes.** Todos viven en dos archivos (`src/data/store.ts` y `src/data/products.ts`) marcados con el valor `PENDIENTE` o `null`. La interfaz debe funcionar bien con esos valores vacíos (ver §4.3) y el script `pnpm check:data` debe listar todo lo pendiente.

---

## 1. Visión del proyecto

### Visión
HOOPZ es una tienda online de baloncesto ubicada en **Aragua, Venezuela**. Vende jerseys NBA (actuales y retro), chaquetas de calentamiento y ropa de entrenamiento. No tiene tienda física ni pasarela de pago: **todo pedido se cierra por WhatsApp**.

El producto es un **catálogo web de una sola página, mobile-first, con motion graphics**. Se comparte como link por WhatsApp y se abre casi siempre en el celular, muchas veces con datos móviles lentos. Cada prenda tiene un botón que abre WhatsApp con un mensaje ya escrito (producto, talla y precio). La estética parte del logo: oscura, gótica y urbana, una "arena de noche" donde las prendas recortadas flotan bajo un foco de luz y ponen todo el color.

### Objetivos
- Que alguien que abre el link desde WhatsApp vea las prendas y escriba para pedir en menos de 30 segundos.
- Transmitir una marca premium con animaciones de nivel profesional que no sacrifiquen velocidad.
- Que el dueño pueda cambiar precios, tallas y productos editando un solo archivo, sin tocar diseño.

### Métricas de éxito
- LCP < 2.5 s en móvil con red "Slow 4G" (Lighthouse móvil: Performance ≥ 90, Accessibility ≥ 95).
- Peso inicial de la página < 700 KB transferidos (sin contar imágenes lazy).
- 100 % de los productos con un link de WhatsApp correcto (verificado por test).
- Cada link de producto (`/p/<slug>`) muestra su propia vista previa con imagen al pegarlo en WhatsApp.

---

## 2. Stack tecnológico

| Capa | Tecnología | Por qué |
|------|-----------|---------|
| Framework | **Astro** (última estable, `npm create astro@latest`) | HTML estático y JS solo donde hay animación. Ideal para conexiones lentas |
| Lenguaje | **TypeScript** (modo `strict`) | Datos de producto tipados; sin errores de precio/talla |
| Estilos | **Tailwind CSS v4** vía `@tailwindcss/vite` | Tokens en CSS (`@theme`), rápido de iterar |
| Componentes | Componentes `.astro` + scripts TS vanilla | No hace falta React: la interactividad es una hoja de producto y un filtro |
| Motion | **GSAP 3** (paquete `gsap`, gratis con todos sus plugins) + ScrollTrigger + SplitText + Flip + DrawSVGPlugin | Estándar profesional de motion graphics web |
| Scroll suave | **Lenis** (paquete `lenis`) | Solo en dispositivos con puntero fino (desktop); en táctil, scroll nativo |
| Validación de datos | **zod** | Valida `products.ts` en build; errores claros si el dueño se equivoca |
| Imágenes | `astro:assets` (`<Image>`, `getImage`) → AVIF/WebP | Recortes con transparencia en AVIF pesan ~30-60 KB |
| Recorte de fondo | **rembg** (Python, local, open source) | Quita la sábana de cuadros de las 32 fotos |
| Imágenes OG | **sharp** (script Node) | Vista previa propia por producto al compartir en WhatsApp |
| Fuentes | **Fontsource** (self-hosted) | Sin parpadeo ni dependencia de Google Fonts |
| Iconos | **lucide-static** (SVG inline) + SVG propio del logo de WhatsApp | Sin emojis como iconos |
| Analítica | **Cloudflare Web Analytics** (opcional) | Gratis, sin cookies |
| Hosting | **Cloudflare Pages** | Gratis también para uso comercial, CDN rápido; dominio `*.pages.dev` hasta tener uno propio |
| Gestor de paquetes | **pnpm** | Rápido y determinista |
| Tests | **Vitest** (unit) + **Playwright** (E2E) | Lógica de WhatsApp y flujos críticos |

**No usar:** React/Vue/Svelte, jQuery, librerías de carrusel (Swiper, etc.), Framer Motion, CMS, base de datos ni backend.

---

## 3. Estructura de directorios

```
hoopz-catalogo/
  assets-src/                      # copia de hoopz-assets/ (NO se sirve al público)
    logo/hoopz-logo.png
    fotos/*.jpg                    # 32 fotos originales ya rotadas
  scripts/
    process-images.py              # rembg: fotos → recortes PNG transparentes en src/assets/products/
    contact-sheet.py               # hoja de contacto para revisar los recortes a ojo
    make-og.mjs                    # sharp: genera public/og/*.jpg (1200×630) y favicons
    check-data.ts                  # (se ejecuta con tsx) lista campos PENDIENTE; --strict falla si falta el WhatsApp
  public/
    og/default.jpg                 # generado por make-og.mjs
    og/<slug>.jpg                  # generado, uno por producto
    favicon.png, apple-touch-icon.png  # generados desde el logo
    robots.txt
  src/
    assets/
      brand/hoopz-logo.png         # copia del logo
      products/<slug>-frente.png   # recortes generados (se versionan en git)
      products/<slug>-espalda.png
    data/
      store.ts                     # datos de la tienda (WhatsApp, Instagram, envíos)  ← EDITA EL DUEÑO
      products.ts                  # los 19 productos                                  ← EDITA EL DUEÑO
      schema.ts                    # esquemas zod + tipos
    lib/
      whatsapp.ts                  # construye URLs wa.me con mensaje prellenado
      format.ts                    # formateo de precio ($), etiquetas
      catalog.ts                   # carga/valida productos, resuelve imágenes, agrupa por categoría
    styles/
      global.css                   # Tailwind + tokens @theme + base + grano + reduced-motion
    layouts/
      BaseLayout.astro             # <head>, meta OG, fuentes, script de clase .js, grano
    components/
      Intro.astro                  # overlay de intro (solo con JS, solo 1ª visita)
      Header.astro                 # logo pequeño + botón WhatsApp; se oculta al bajar
      Hero.astro                   # titular cinético + jersey destacado rotativo + líneas de cancha
      CourtLines.astro             # SVG de media cancha (para DrawSVG)
      Marquee.astro                # cinta infinita con velocidad ligada al scroll
      Catalog.astro                # sección catálogo: FilterBar + grid
      FilterBar.astro              # chips: Todo · Actuales · Retro · Chaquetas · Entrenamiento
      ProductCard.astro            # tarjeta (es un <a href="/p/slug">)
      ProductDetail.astro          # contenido de detalle (reutilizado en la hoja y en /p/[slug])
      ProductSheet.astro           # <dialog> que muestra ProductDetail sobre el catálogo
      HowToOrder.astro             # 3 pasos con línea que se dibuja con el scroll
      Footer.astro                 # CTA final + datos de la tienda
      WhatsAppFab.astro            # botón flotante
      icons/WhatsAppIcon.astro     # SVG del glifo de WhatsApp
    scripts/                       # TS de cliente (importados desde <script> de Astro)
      main.ts                      # entrada: registra plugins GSAP, gsap.matchMedia, inicializa módulos
      motion/smooth-scroll.ts      # Lenis + ScrollTrigger (solo pointer:fine)
      motion/intro.ts
      motion/hero.ts
      motion/reveals.ts            # ScrollTrigger.batch para tarjetas y títulos
      motion/marquee.ts
      motion/how-to-order.ts
      motion/header.ts
      ui/filter.ts                 # filtro con GSAP Flip + URL ?cat=
      ui/sheet.ts                  # apertura/cierre del <dialog>, history.pushState, flip frente/espalda
      ui/sizes.ts                  # selector de talla → actualiza href de WhatsApp
      ui/share.ts                  # navigator.share con fallback a copiar link
    pages/
      index.astro                  # catálogo
      p/[slug].astro               # página estática por producto (getStaticPaths)
      404.astro
  tests/
    unit/whatsapp.test.ts
    unit/data.test.ts
    e2e/catalog.spec.ts
  astro.config.mjs
  tsconfig.json
  playwright.config.ts
  vitest.config.ts
  package.json
  CLAUDE.md
  COMO-ACTUALIZAR.md               # guía en español para el dueño (editar precios/tallas/productos)
  README.md
```

---

## 4. Modelo de datos

No hay base de datos. Los datos son archivos TypeScript versionados en git y validados con zod en build.

### 4.1 Entidades

**Store** (`src/data/store.ts`)
| Campo | Tipo | Notas |
|-------|------|-------|
| name | `string` | `"HOOPZ"` |
| whatsapp | `string` | Solo dígitos, formato internacional sin `+` ni `0` inicial. Ej.: `0414-123-4567` → `"584141234567"`. **PENDIENTE** |
| instagram | `string \| null` | Usuario sin `@`. **PENDIENTE** (`null`) |
| location | `string` | `"Aragua, Venezuela"` |
| shipping | `string \| null` | Texto corto, p. ej. `"Envíos a toda Venezuela"`. **PENDIENTE** (`null`) |
| currency | `"USD"` | Precios en dólares, se muestran como `$35` |
| siteUrl | `string` | URL pública. Por defecto `"https://hoopz.pages.dev"`; se cambia al publicar |
| cfAnalyticsToken | `string \| null` | Opcional |

**Product** (`src/data/products.ts`)
| Campo | Tipo | Notas |
|-------|------|-------|
| slug | `string` | Único, kebab-case, coincide con los nombres de archivo de imagen |
| category | `"actuales" \| "retro" \| "chaquetas" \| "entrenamiento"` | Define el filtro |
| title | `string` | Lo que se muestra: `"LeBron James"`, `"Chaqueta Thunder"` |
| team | `string \| null` | `"Los Angeles Lakers"` (null en entrenamiento) |
| number | `string \| null` | `"23"` (string para conservar `"0"`) |
| bgText | `string` | Texto gigante contorneado detrás de la prenda: número, sigla o `"HOOPZ"` |
| season | `string \| null` | Solo retros con temporada conocida: `"2009-10"` |
| variant | `string` | Color o edición en palabras: `"Dorada"`, `"City Edition · Blanca"` |
| accent | `` `#${string}` `` | Color decorativo de la prenda (número gigante, foco, chip activo en su hoja). Contraste ≥ 4.5:1 sobre `#0B0B0C` |
| images | `{ front?: string; back?: string }` | Nombres base de imagen; al menos una |
| price | `number \| null` | USD. **PENDIENTE** (`null`) |
| sizes | `string[]` | Ej. `["S","M","L","XL","2XL"]`. **PENDIENTE** (`[]`) |
| soldOut | `boolean` | Por defecto `false`; si es `true`, la tarjeta muestra "Agotado" y no hay botón de pedido |
| featured | `boolean` | Aparece en el carrusel del hero (exactamente 3 en `true`) |
| order | `number` | Orden dentro de su categoría |

### 4.2 Esquema (`src/data/schema.ts`)

```ts
import { z } from "zod";

export const CATEGORIES = ["actuales", "retro", "chaquetas", "entrenamiento"] as const;
export const CATEGORY_LABEL: Record<(typeof CATEGORIES)[number], string> = {
  actuales: "Actuales",
  retro: "Retro",
  chaquetas: "Chaquetas",
  entrenamiento: "Entrenamiento",
};

export const storeSchema = z.object({
  name: z.string(),
  whatsapp: z.union([z.literal("PENDIENTE"), z.string().regex(/^58\d{10}$/, "Formato: 58 + 10 dígitos, ej. 584141234567")]),
  instagram: z.string().regex(/^[A-Za-z0-9._]+$/).nullable(),
  location: z.string(),
  shipping: z.string().nullable(),
  currency: z.literal("USD"),
  siteUrl: z.string().url(),
  cfAnalyticsToken: z.string().nullable(),
});

export const productSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  category: z.enum(CATEGORIES),
  title: z.string(),
  team: z.string().nullable(),
  number: z.string().nullable(),
  bgText: z.string().max(6),
  season: z.string().nullable(),
  variant: z.string(),
  accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  images: z.object({ front: z.string().optional(), back: z.string().optional() })
    .refine((i) => i.front || i.back, "Cada producto necesita al menos una imagen"),
  price: z.number().positive().nullable(),
  sizes: z.array(z.string()),
  soldOut: z.boolean(),
  featured: z.boolean(),
  order: z.number().int(),
});

export type Store = z.infer<typeof storeSchema>;
export type Product = z.infer<typeof productSchema>;
export type Category = (typeof CATEGORIES)[number];
```

`src/lib/catalog.ts` valida ambos archivos al importar (`storeSchema.parse`, `z.array(productSchema).parse`). Además comprueba: slugs únicos, exactamente 3 `featured`, y que cada imagen referenciada exista en `src/assets/products/` (usa `import.meta.glob("/src/assets/products/*.png", { eager: true })`). Si algo falla, el build se rompe con un mensaje en español.

### 4.3 Comportamiento con datos pendientes (obligatorio)

| Dato pendiente | Qué muestra la interfaz |
|---|---|
| `price: null` | En lugar del precio: "Precio por WhatsApp". El mensaje de WhatsApp omite la línea de precio |
| `sizes: []` | No hay selector de talla. El mensaje dice "Talla: te la confirmo por aquí" |
| `whatsapp: "PENDIENTE"` | Los botones de WhatsApp apuntan a `#` con `aria-disabled="true"` y muestran el toast "WhatsApp aún no configurado". `pnpm check:data --strict` falla, y el script de deploy lo ejecuta |
| `instagram: null` | No se renderiza el link de Instagram |
| `shipping: null` | No se renderiza la línea de envíos ni el ítem de envíos de la marquesina |

### 4.4 `src/data/store.ts` (contenido inicial exacto)

```ts
import type { Store } from "./schema";

// ✏️ EDITA AQUÍ los datos de la tienda. Ver COMO-ACTUALIZAR.md
export const store: Store = {
  name: "HOOPZ",
  whatsapp: "PENDIENTE",          // ej. "584141234567" (58 + número sin el 0)
  instagram: null,                // ej. "hoopz.ve" (sin @)
  location: "Aragua, Venezuela",
  shipping: null,                 // ej. "Envíos a toda Venezuela"
  currency: "USD",
  siteUrl: "https://hoopz.pages.dev",
  cfAnalyticsToken: null,
};
```

### 4.5 `src/data/products.ts` (contenido inicial exacto, 19 productos)

```ts
import type { Product } from "./schema";

// ✏️ EDITA AQUÍ precios (price) y tallas (sizes). Ver COMO-ACTUALIZAR.md
const P = { price: null, sizes: [] as string[], soldOut: false }; // valores PENDIENTES por defecto

export const products: Product[] = [
  // ── ACTUALES ──────────────────────────────────────────────
  { slug: "lakers-james-23", category: "actuales", title: "LeBron James", team: "Los Angeles Lakers", number: "23", bgText: "23", season: null, variant: "Dorada", accent: "#FDB927", images: { front: "lakers-james-23-frente", back: "lakers-james-23-espalda" }, featured: false, order: 1, ...P },
  { slug: "knicks-barrett-9", category: "actuales", title: "RJ Barrett", team: "New York Knicks", number: "9", bgText: "9", season: null, variant: "Naranja", accent: "#F58426", images: { front: "knicks-barrett-9-frente", back: "knicks-barrett-9-espalda" }, featured: false, order: 2, ...P },
  { slug: "mavericks-irving-11", category: "actuales", title: "Kyrie Irving", team: "Dallas Mavericks", number: "11", bgText: "11", season: null, variant: "Azul", accent: "#4D86F0", images: { front: "mavericks-irving-11-frente", back: "mavericks-irving-11-espalda" }, featured: false, order: 3, ...P },
  { slug: "rockets-sheppard-15", category: "actuales", title: "Reed Sheppard", team: "Houston Rockets", number: "15", bgText: "15", season: null, variant: "City Edition · Blanca", accent: "#E8264A", images: { front: "rockets-sheppard-15-frente", back: "rockets-sheppard-15-espalda" }, featured: false, order: 4, ...P },
  { slug: "heat-butler-22", category: "actuales", title: "Jimmy Butler", team: "Miami Heat", number: "22", bgText: "22", season: null, variant: "Azul Vice", accent: "#F05BC0", images: { front: "heat-butler-22-frente", back: "heat-butler-22-espalda" }, featured: true, order: 5, ...P },
  { slug: "celtics-tatum-0", category: "actuales", title: "Jayson Tatum", team: "Boston Celtics", number: "0", bgText: "0", season: null, variant: "Negra", accent: "#2BB463", images: { back: "celtics-tatum-0-espalda" }, featured: false, order: 6, ...P },
  { slug: "sixers-george-8", category: "actuales", title: "Paul George", team: "Philadelphia 76ers", number: "8", bgText: "8", season: null, variant: "City Edition · Blanca", accent: "#5B7BF0", images: { front: "sixers-george-8-frente", back: "sixers-george-8-espalda" }, featured: false, order: 7, ...P },
  { slug: "grizzlies-morant-12", category: "actuales", title: "Ja Morant", team: "Memphis Grizzlies", number: "12", bgText: "12", season: null, variant: "Azul marino", accent: "#8FB0DB", images: { front: "grizzlies-morant-12-frente", back: "grizzlies-morant-12-espalda" }, featured: false, order: 8, ...P },
  { slug: "wizards-poole-13", category: "actuales", title: "Jordan Poole", team: "Washington Wizards", number: "13", bgText: "13", season: null, variant: "City Edition · Celeste", accent: "#EE3346", images: { front: "wizards-poole-13-frente", back: "wizards-poole-13-espalda" }, featured: false, order: 9, ...P },

  // ── RETRO ─────────────────────────────────────────────────
  { slug: "lakers-bryant-24", category: "retro", title: "Kobe Bryant", team: "Los Angeles Lakers", number: "24", bgText: "24", season: "2009-10", variant: "Blanca", accent: "#FDB927", images: { front: "lakers-bryant-24-frente", back: "lakers-bryant-24-espalda" }, featured: true, order: 1, ...P },
  { slug: "celtics-bird-33", category: "retro", title: "Larry Bird", team: "Boston Celtics", number: "33", bgText: "33", season: "1985-86", variant: "Negra y verde", accent: "#2BB463", images: { front: "celtics-bird-33-frente", back: "celtics-bird-33-espalda" }, featured: true, order: 2, ...P },
  { slug: "bulls-rodman-91", category: "retro", title: "Dennis Rodman", team: "Chicago Bulls", number: "91", bgText: "91", season: null, variant: "Roja", accent: "#E8264A", images: { front: "bulls-rodman-91-frente", back: "bulls-rodman-91-espalda" }, featured: false, order: 3, ...P },

  // ── CHAQUETAS ─────────────────────────────────────────────
  { slug: "chaqueta-thunder", category: "chaquetas", title: "Chaqueta Thunder", team: "Oklahoma City Thunder", number: null, bgText: "OKC", season: null, variant: "Azul · con capucha", accent: "#2C9BE0", images: { front: "chaqueta-thunder-frente", back: "chaqueta-thunder-espalda" }, featured: false, order: 1, ...P },
  { slug: "chaqueta-lakers", category: "chaquetas", title: "Chaqueta Lakers", team: "Los Angeles Lakers", number: null, bgText: "LAL", season: null, variant: "Morada · con capucha", accent: "#FDB927", images: { front: "chaqueta-lakers-frente", back: "chaqueta-lakers-espalda" }, featured: false, order: 2, ...P },

  // ── ENTRENAMIENTO ─────────────────────────────────────────
  { slug: "esqueleto-nike-negro", category: "entrenamiento", title: "Esqueleto Nike Dri-FIT", team: null, number: null, bgText: "HOOPZ", season: null, variant: "Negro · logo dorado", accent: "#D9B54A", images: { front: "esqueleto-nike-negro-frente" }, featured: false, order: 1, ...P },
  { slug: "esqueleto-adidas-negro", category: "entrenamiento", title: "Esqueleto Adidas", team: null, number: null, bgText: "HOOPZ", season: null, variant: "Negro · detalles reflectivos", accent: "#A58BEA", images: { front: "esqueleto-adidas-negro-frente" }, featured: false, order: 2, ...P },
  { slug: "esqueleto-nike-azul", category: "entrenamiento", title: "Esqueleto Nike Dri-FIT", team: null, number: null, bgText: "HOOPZ", season: null, variant: "Azul rey", accent: "#5C7CFF", images: { front: "esqueleto-nike-azul-frente" }, featured: false, order: 3, ...P },
  { slug: "franela-nike-gris", category: "entrenamiento", title: "Franela Nike Running", team: null, number: null, bgText: "HOOPZ", season: null, variant: "Gris azulado", accent: "#9AA0D4", images: { front: "franela-nike-gris-frente" }, featured: false, order: 4, ...P },
  { slug: "franela-adidas-beige", category: "entrenamiento", title: "Franela Adidas", team: null, number: null, bgText: "HOOPZ", season: null, variant: "Beige", accent: "#F2643A", images: { front: "franela-adidas-beige-frente" }, featured: false, order: 5, ...P },
];
```

Conteos esperados (los tests los verifican): **19** en total · Actuales **9** · Retro **3** · Chaquetas **2** · Entrenamiento **5**. Destacados del hero (`featured`): Heat Butler, Kobe Bryant, Larry Bird.

### 4.6 Relaciones
Ninguna. `Product.category` es un enum; `Product.images.*` referencia archivos en `src/assets/products/`.

---

## 5. Diseño de "API"

No hay backend ni rutas de API. La única integración externa es el **deep link de WhatsApp**.

### `src/lib/whatsapp.ts`

```ts
import type { Product, Store } from "@/data/schema";
import { formatPrice } from "./format";

export function isWhatsAppReady(store: Store): boolean {
  return store.whatsapp !== "PENDIENTE";
}

/** Mensaje general (header, FAB, footer). */
export function generalWhatsAppUrl(store: Store): string | null {
  if (!isWhatsAppReady(store)) return null;
  return `https://wa.me/${store.whatsapp}?text=${encodeURIComponent("¡Hola HOOPZ! Vi el catálogo y quiero hacer un pedido.")}`;
}

/** Mensaje de pedido de un producto. `size` es null si aún no eligió o no hay tallas. */
export function productWhatsAppUrl(store: Store, p: Product, size: string | null): string | null {
  if (!isWhatsAppReady(store)) return null;
  const lines = [
    "¡Hola HOOPZ! Quiero pedir:",
    `• ${productLabel(p)}`,
    `• Talla: ${size ?? "te la confirmo por aquí"}`,
  ];
  if (p.price !== null) lines.push(`• Precio: ${formatPrice(p.price)}`);
  lines.push(`${store.siteUrl}/p/${p.slug}`);
  return `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
}

/** "Jersey Lakers · LeBron James #23" | "Chaqueta Thunder" | "Esqueleto Nike Dri-FIT (Negro · logo dorado)" */
export function productLabel(p: Product): string {
  if (p.category === "actuales" || p.category === "retro") {
    const teamShort = p.team!.split(" ").at(-1); // "Lakers", "76ers", "Heat"…
    return `Jersey ${teamShort} · ${p.title}${p.number !== null ? ` #${p.number}` : ""}${p.season ? ` (${p.season})` : ""}`;
  }
  if (p.category === "chaquetas") return p.title;
  return `${p.title} (${p.variant})`;
}
```

`src/lib/format.ts`: `formatPrice(n) => "$" + (Number.isInteger(n) ? n : n.toFixed(2))`.

**Detalle de la URL:** siempre `https://wa.me/<número>?text=<encodeURIComponent>`. Nunca `api.whatsapp.com`. Abrir con `target="_blank" rel="noopener"`.

---

## 6. Arquitectura frontend

### 6.1 Rutas

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/` | `index.astro` | Catálogo completo: intro, hero, marquesina, catálogo con filtro, cómo pedir, footer |
| `/?cat=retro` | `index.astro` | Igual, con el filtro preseleccionado (link compartible por categoría) |
| `/p/<slug>` | `p/[slug].astro` | Página estática del producto (19 páginas generadas). OG propio. Se usa al abrir un link compartido y como fallback sin JS |
| `/404` | `404.astro` | "Esta jugada no existe." + botón "Volver al catálogo" |

### 6.2 Flujo de navegación (crítico)

1. Cada `ProductCard` es un `<a href="/p/<slug>">`. Sin JS, navega a la página del producto y todo funciona.
2. Con JS, `ui/sheet.ts` intercepta el clic: `preventDefault()`, abre el `<dialog>` con el detalle y hace `history.pushState({ sheet: slug }, "", "/p/<slug>")`.
3. Botón "atrás" de Android/navegador → evento `popstate` → cierra la hoja (no sale del catálogo).
4. Cerrar la hoja con X, swipe hacia abajo o tap en el fondo → `history.back()` si el estado actual es de la hoja; si no, `replaceState` a `/`.
5. Cargar directamente `/p/<slug>` (link compartido) → se sirve la página estática del producto, con botón "Ver todo el catálogo" que lleva a `/`.
6. El filtro actualiza `?cat=` con `history.replaceState` (no ensucia el historial).

### 6.3 Datos al cliente
- `index.astro` calcula en build, por producto, las URLs optimizadas con `getImage()` (AVIF, 900 px de ancho, y `srcset` 480/900) y serializa un JSON `{ slug, label, priceText, sizes, images, accent, waBase… }` en `<script type="application/json" id="catalog-data">`.
- `ui/sheet.ts` lee ese JSON y rellena el `<dialog>`. **Un solo** `<dialog>` en el DOM y no 19.
- Estado del cliente: talla elegida (por producto, en memoria), filtro activo, intro vista (`sessionStorage["hoopz-intro"]`). Sin librerías de estado.

### 6.4 Jerarquía de componentes

```
index.astro
└─ BaseLayout
   ├─ Intro                    (overlay; inyectado/activado solo si html.js y no visto)
   ├─ Header                   (logo 32px · botón WhatsApp)
   ├─ main
   │  ├─ Hero
   │  │  ├─ CourtLines (SVG de fondo)
   │  │  ├─ h1 "VISTE EL JUEGO" (SplitText)
   │  │  ├─ párrafo + 2 CTA
   │  │  └─ FeaturedStage (3 prendas featured apiladas, número gigante detrás)
   │  ├─ Marquee
   │  ├─ Catalog
   │  │  ├─ h2 "El catálogo"
   │  │  ├─ FilterBar (sticky)
   │  │  └─ ul.grid → ProductCard × 19 (con data-category)
   │  ├─ HowToOrder (3 pasos)
   │  └─ Footer (CTA final + info)
   ├─ WhatsAppFab
   └─ ProductSheet (<dialog>) → ProductDetail

p/[slug].astro
└─ BaseLayout (OG = /og/<slug>.jpg)
   ├─ Header
   ├─ ProductDetail (versión página)
   ├─ "También te puede gustar": 4 tarjetas de la misma categoría
   └─ Footer
```

### 6.5 Especificación de cada sección (contenido + motion)

> Todo el motion vive dentro de `gsap.matchMedia()` con la condición `"(prefers-reduced-motion: no-preference)"`. En `reduce`, el contenido aparece estático o con fundidos de ≤ 200 ms. **Regla de oro:** el contenido es visible por defecto en el HTML/CSS; las animaciones parten de `gsap.from()` aplicadas por JS. Si JS falla, la página se ve completa.
>
> Curvas: `expo.out` para entradas, `power3.inOut` para transiciones de estado, `none` para scrub. Duraciones: micro-interacciones 150-250 ms, revelados 600-900 ms, momentos de marca hasta 1.2 s. **Prohibido** `elastic` y `back`; `bounce.out` solo para la pelota de la intro (es física literal).

#### A. Intro (`Intro.astro` + `motion/intro.ts`), ≤ 1.8 s
- Solo si: `html.js` presente, `sessionStorage["hoopz-intro"]` vacío y sin reduced motion. Si no, no existe.
- Overlay `position:fixed`, fondo `--color-bg`, z-index `--z-intro`.
- Secuencia (timeline GSAP):
  1. 0.00-0.55 s: una **pelota SVG** (círculo plata `#C8C8CC` con 4 costuras en `#0B0B0C`, dibujada a mano en SVG de 64×64) cae desde arriba hasta el centro con `bounce.out` (2 rebotes).
  2. 0.55-0.80 s: en el último contacto, flash de foco: un `radial-gradient` blanco con 15 % de opacidad crece desde el punto de impacto (scale 0→1, opacity 1→0).
  3. 0.60-1.30 s: el logo `hoopz-logo.png` (≈ 260 px) se revela: `clip-path: inset(50% 0 50% 0)` → `inset(0)`, `filter: blur(8px)` → `blur(0)`, `scale 1.08 → 1`. La pelota SVG se desvanece al aparecer el logo.
  4. 1.00-1.40 s: **barrido de luz** sobre el logo: un pseudo-elemento con `linear-gradient(100deg, transparent 40%, rgba(255,255,255,.35) 50%, transparent 60%)` y `mix-blend-mode: screen` cruza de izquierda a derecha, enmascarado a la forma del logo (`mask-image: url(logo)`, `mask-size: contain`).
  5. 1.40-1.80 s: el overlay sale con `clip-path: inset(0 0 0 0)` → `inset(0 0 100% 0)` (cortina hacia arriba). Al terminar: `sessionStorage["hoopz-intro"]="1"`, se elimina del DOM y arranca la timeline del hero.
- Saltable: tap/clic/tecla en cualquier parte → `tl.progress(1)`.
- Nunca bloquea: el catálogo debajo ya está renderizado; las imágenes del hero cargan en paralelo.
- **Mejora futura (no hacer ahora):** si el dueño entrega el logo vectorizado (SVG por capas), animar pelota, alas y wordmark por separado.

#### B. Header (`Header.astro` + `motion/header.ts`)
- Altura 56 px, fondo `rgb(11 11 12 / .72)` con `backdrop-filter: blur(12px)` (único uso de blur decorativo; justificado por legibilidad sobre contenido).
- Izquierda: logo 32 px de alto (`<Image>` del PNG; el fondo negro del PNG se integra con el header oscuro). Derecha: botón "Pedir" (icono WhatsApp + texto, 44 px de alto mínimo).
- Se oculta al bajar (`yPercent: -100`) y reaparece al subir (`ScrollTrigger` `onUpdate` con `self.direction`), 250 ms `power3.out`. Visible siempre dentro del hero.

#### C. Hero (`Hero.astro` + `motion/hero.ts`), `min-height: 100svh`
- Fondo: `CourtLines` (SVG de media cancha: círculo central, zona, arco de 3 puntos y línea de fondo) en trazo `#C8C8CC` al 12 % de opacidad, 1.5 px, a sangre y anclado abajo. Se **dibuja** con `DrawSVGPlugin` (`drawSVG: "0%"` → `"100%"`, 1.4 s, stagger 0.1) al terminar la intro.
- Foco: `radial-gradient(ellipse at 50% 30%, color-mix(in oklch, var(--accent) 22%, transparent), transparent 60%)` detrás del escenario; `--accent` cambia con el jersey destacado activo (transición GSAP de la custom property, 600 ms).
- Texto (móvil, arriba):
  - `h1`: **"VISTE EL JUEGO"** en Big Shoulders 900, `clamp(3.5rem, 16vw, 6rem)`, `letter-spacing: -0.01em`, `line-height: .9`. SplitText por caracteres con máscara de línea: `yPercent: 110 → 0`, stagger 0.025, 0.9 s `expo.out`.
  - Párrafo (Manrope 16-18 px, `--color-muted`): **"Jerseys NBA actuales y retro, chaquetas y ropa de entrenamiento. Pides por WhatsApp desde Aragua."** Fade + `y: 16`.
  - CTA primario: **"Ver catálogo"** (scroll suave a `#catalogo`). CTA secundario (texto con subrayado): **"Escríbenos"** → WhatsApp general.
- **FeaturedStage** (abajo en móvil, a la derecha en ≥ 1024 px): las 3 prendas `featured` (espalda si existe, porque muestra nombre y número) superpuestas. Solo una visible a la vez:
  - Detrás de cada una, su `bgText` gigante en Big Shoulders 900 (`clamp(10rem, 55vw, 22rem)`), **solo contorno** (`-webkit-text-stroke: 2px var(--accent)`, `color: transparent`), opacidad .35.
  - Ciclo cada 4 s: la prenda saliente baja y se desvanece (`y: 40, opacity: 0, rotate: -4`), la entrante sube (`y: -40→0, rotate: 4→0`, `expo.out` 0.9 s). Los dígitos del número cambian con un "rodillo": cada carácter sale hacia arriba y entra desde abajo dentro de una máscara (stagger 0.06).
  - Flotación continua sutil: `y: ±8px`, 3 s `sine.inOut`, yoyo infinito.
  - Parallax con scroll: el escenario se mueve `yPercent: -12` y el número `yPercent: -25` (scrub).
  - El ciclo se pausa con `document.hidden` y al salir el hero del viewport (ScrollTrigger `onToggle`).
  - Debajo: chip con equipo, jugador y temporada (si es retro) del destacado activo.

#### D. Marquesina (`Marquee.astro` + `motion/marquee.ts`)
- Banda de 56 px con borde superior e inferior `--color-line`. Texto en Big Shoulders 800 uppercase, 28 px: `PEDIDOS POR WHATSAPP ✦ ACTUALES ✦ RETRO ✦ CHAQUETAS ✦ ENTRENAMIENTO ✦ ARAGUA, VENEZUELA ✦` (+ `store.shipping` en mayúsculas si existe). El separador `✦` es un SVG pequeño en plata, no un carácter emoji.
- Contenido duplicado para bucle infinito con `xPercent` (GSAP, `ease: none`). Velocidad base 40 px/s; `ScrollTrigger.getVelocity()` la acelera temporalmente (hasta ×4) y cambia de dirección según el sentido del scroll, volviendo a la base en 0.6 s.

#### E. Catálogo (`Catalog.astro`, `FilterBar.astro`, `ProductCard.astro`, `ui/filter.ts`, `motion/reveals.ts`)
- `section#catalogo`. `h2` **"El catálogo"** (Big Shoulders 900, `clamp(2.5rem, 10vw, 4.5rem)`) + contador a la derecha **"19 piezas"** que se actualiza con el filtro (número animado con un tween de 400 ms).
- **FilterBar** sticky (`top: 56px` cuando el header está visible, `top: 0` cuando está oculto; transición sincronizada). Chips en scroll horizontal (`overflow-x: auto`, `scroll-snap-type: x`), sin barra visible:
  `Todo (19) · Actuales (9) · Retro (3) · Chaquetas (2) · Entrenamiento (5)`.
  Chip: 40 px de alto, padding 0 16 px, radio total, borde `--color-line`; activo = fondo `--color-ink`, texto `--color-bg`. Es un `role="radiogroup"` con `role="radio"` y `aria-checked`. Navegación con flechas.
- **Filtrado con GSAP Flip:** `Flip.getState(cards)` → alternar `hidden` según `data-category` → `Flip.from(state, { duration: .6, ease: "power3.inOut", stagger: .02, absolute: true, onEnter: el => gsap.fromTo(el, {opacity:0, scale:.9}, {opacity:1, scale:1, duration:.4}), onLeave: el => gsap.to(el, {opacity:0, scale:.9, duration:.3}) })`. Después, `ScrollTrigger.refresh()`. Si el usuario está más abajo del inicio del grid, scroll suave hasta el FilterBar.
- **Grid:** 2 columnas en móvil (gap 12 px), 3 en ≥ 768 px y 4 en ≥ 1280 px. `max-width: 1280px`.
- **ProductCard** (`<li>` > `<a>`): sin borde, fondo `--color-surface`, radio 20 px, `aspect-ratio: 4/5` para la zona de imagen.
  - Capa 1: foco de luz `radial-gradient(circle at 50% 35%, color-mix(in oklch, var(--accent) 28%, transparent), transparent 65%)`.
  - Capa 2: `bgText` gigante contorneado en `--accent` (opacidad .25), centrado.
  - Capa 3: recorte de la prenda (frente si existe), `object-fit: contain`, con sombra de suelo (`filter: drop-shadow(0 24px 24px rgb(0 0 0 / .6))`).
  - Pie: `title` (Manrope 600, 15 px, 2 líneas máx.), `variant` (13 px, muted), precio (Big Shoulders 800, 22 px, `--color-ink`) o "Precio por WhatsApp" (13 px, muted).
  - Retro: además, chip **"RETRO · 2009-10"** arriba a la izquierda (o solo "RETRO" sin temporada) y una capa de grano más visible (opacidad .12) para un look de película.
  - `soldOut`: imagen en escala de grises al 60 % y chip "Agotado".
  - Interacción: en `(hover: hover)`, tilt 3D sutil con el puntero (`rotateX/Y` máx. 6°, `transformPerspective: 800`, `quickTo` 300 ms) y la prenda sube 6 px. En táctil, `:active` con `scale(.98)` en 120 ms.
- **Revelado:** `ScrollTrigger.batch(".product-card", { start: "top 90%", once: true, onEnter: batch => gsap.from(batch, { y: 48, opacity: 0, clipPath: "inset(12% 0 0 0 round 20px)", duration: .8, ease: "expo.out", stagger: .08 }) })`. El `h2` usa SplitText por palabras (solo este título y el del hero usan SplitText).

#### F. Hoja de producto (`ProductSheet.astro` + `ProductDetail.astro` + `ui/sheet.ts`, `ui/sizes.ts`, `ui/share.ts`)
- `<dialog>` nativo (`showModal()`): da foco atrapado, `Esc` y fondo inerte. En móvil es una **hoja inferior** (alto máx. 92 svh, radio superior 24 px, asa de 36×4 px); en ≥ 768 px es un panel centrado de 880 px a 2 columnas.
- Bloquear el scroll del body (y `lenis.stop()` si está activo) mientras está abierta.
- Entrada: backdrop `opacity 0 → .7`; hoja `yPercent: 100 → 0`, 0.5 s `expo.out`; la prenda entra con `scale .9 → 1` y `opacity` con 0.1 s de retraso. Salida: inversa en 0.35 s `power3.in`.
- **Arrastrar para cerrar** (móvil): pointer events en el asa y la cabecera; si el arrastre supera 120 px o la velocidad es > 0.5 px/ms, se cierra; si no, vuelve con 0.3 s.
- Contenido (`ProductDetail`):
  1. **Escenario de imagen** con foco y `bgText` (igual que la tarjeta, pero más grande). Si hay frente y espalda: botón **"Ver espalda" / "Ver frente"** que hace un **giro 3D** de la prenda (`rotateY 0 → 180`, 0.7 s `power3.inOut`, `backface-visibility: hidden`, dos caras apiladas). Swipe horizontal sobre la imagen también gira.
  2. `team` (13 px uppercase muted, es la única "etiqueta" en mayúsculas del componente) · `title` (Big Shoulders 900, 40 px) · `#number` y, en retros, "Temporada 2009-10" · `variant`.
  3. Precio grande o "Precio por WhatsApp".
  4. **Tallas** (si `sizes.length`): `role="radiogroup"` "Elige tu talla", chips de 48×48 px mín. Al elegir, `ui/sizes.ts` actualiza el `href` del botón de pedido.
  5. Botón principal **"Pedir por WhatsApp"** (alto 56 px, ancho completo, fondo `--color-wa`, texto `--color-on-wa`, icono WhatsApp). Si hay tallas y no se eligió ninguna: el clic no navega; desplaza y enfoca el grupo de tallas, muestra el mensaje "Elige una talla para continuar" (`aria-live="polite"`) y resalta el borde del grupo en `--accent` durante 1 s.
  6. Botón secundario **"Compartir"**: `navigator.share({ title, url: siteUrl + "/p/" + slug })`; si no existe, copia el link y muestra el toast "Link copiado".
  7. Línea de confianza (muted, 13 px): **"Te respondemos por WhatsApp para coordinar pago y entrega."** + `store.shipping` si existe.
- `--accent` de la hoja = `accent` del producto (se aplica como custom property en el `<dialog>`).

#### G. Cómo pedir (`HowToOrder.astro` + `motion/how-to-order.ts`)
- `h2` **"Pedir es fácil"**. Tres pasos (secuencia real, aquí sí se numeran):
  1. **Elige tu pieza y tu talla.** "Toca cualquier prenda del catálogo."
  2. **Escríbenos por WhatsApp.** "El mensaje con tu pedido ya va listo, solo dale enviar."
  3. **Coordinamos pago y entrega.** "Te confirmamos disponibilidad y cómo te llega."
- Diseño: columna vertical en móvil con una línea vertical de 2 px que une los números (círculos de 48 px con número en Big Shoulders). Desktop: horizontal.
- Motion: la línea se dibuja con scroll (`scaleY 0 → 1`, `transform-origin: top`, `scrub: true`); cada número "se enciende" (borde plata → relleno `--color-ink`) cuando la línea lo alcanza.

#### H. Footer (`Footer.astro`)
- CTA final: `h2` **"¿No ves tu talla o tu equipo?"** + párrafo **"Escríbenos y te decimos qué tenemos disponible."** + botón "Escribir por WhatsApp".
- Logo HOOPZ grande (máx. 220 px) centrado; al entrar al viewport, barrido de luz (el mismo efecto de la intro, una vez).
- Datos: ubicación · envíos (si existe) · Instagram (si existe, con icono) · "© 2026 HOOPZ".

#### I. Botón flotante (`WhatsAppFab.astro`)
- 56 px, circular, `--color-wa` con icono `--color-on-wa`, `bottom: max(16px, env(safe-area-inset-bottom))`, `right: 16px`, `aria-label="Pedir por WhatsApp"`.
- Aparece cuando el hero sale del viewport (`scale .6 → 1`, `opacity`, 0.4 s `expo.out`) y se oculta mientras la hoja de producto está abierta. **Un solo** pulso de anillo al aparecer (no infinito).

#### J. Capa global
- **Grano:** `body::after` con SVG `feTurbulence` inline como `background-image`, `opacity: .05`, `pointer-events: none`, **estático** (no animar).
- **Foco que sigue al puntero** (solo `(hover: hover) and (pointer: fine)`): una `radial-gradient` de 600 px en `--color-silver` al 5 % sigue el cursor con `gsap.quickTo` (0.6 s).
- **Lenis** (solo `pointer: fine`): `lerp: 0.1`; integración `lenis.on("scroll", ScrollTrigger.update)` + `gsap.ticker.add(t => lenis.raf(t * 1000))` + `gsap.ticker.lagSmoothing(0)`. Los anclajes internos usan `lenis.scrollTo`; sin Lenis, `scrollIntoView({ behavior: "smooth" })`.

### 6.6 Página `/p/[slug]`
- `getStaticPaths()` desde `products`. Usa `ProductDetail` en modo página (sin `<dialog>`), con el mismo giro frente/espalda, tallas y botón.
- `<title>`: `"{productLabel} | HOOPZ"`. `og:image`: `/og/<slug>.jpg`. `og:description`: `"{variant} · {precio o 'Precio por WhatsApp'} · Pide por WhatsApp"`.
- Debajo: **"También te puede gustar"** con 4 tarjetas de la misma categoría (o completar con actuales).
- Botón arriba a la izquierda: "← Catálogo" (`/`).

---

## 7. Sistema de diseño

**Escena (decide el tema):** un chamo en Maracay abre el link desde WhatsApp en su teléfono, de noche, con datos móviles. El logo es plata sobre negro. Por eso el tema es **oscuro**, la interfaz es **monocromática** y **el color lo ponen las prendas** (cada producto trae su `accent`). El único color de interfaz fuera del gris es el verde de WhatsApp, reservado para la acción de pedir.

**Estrategia de color:** Restrained (neutros + plata) en la interfaz; "Full palette" solo a través de las prendas y su `accent`.

### Colores

| Rol | Token CSS | Hex | Uso |
|-----|-----------|-----|-----|
| Fondo | `--color-bg` | `#0B0B0C` | Página |
| Superficie | `--color-surface` | `#151517` | Tarjetas, hoja de producto |
| Superficie 2 | `--color-surface-2` | `#1E1E21` | Chips, inputs, hover |
| Línea | `--color-line` | `#2A2A2E` | Bordes y separadores |
| Tinta | `--color-ink` | `#ECECEC` | Texto principal (16.6:1) |
| Atenuado | `--color-muted` | `#A1A1A8` | Texto secundario (7.6:1 sobre bg, 7.1:1 sobre surface) |
| Tenue | `--color-faint` | `#6B6B73` | Solo decoración y bordes, **nunca texto** |
| Plata (marca) | `--color-silver` | `#C8C8CC` | Líneas de cancha, pelota de la intro, foco del puntero |
| WhatsApp | `--color-wa` | `#25D366` | Botones de pedido y FAB |
| Texto sobre WhatsApp | `--color-on-wa` | `#0B0B0C` | **Obligatorio** (9.9:1). Blanco sobre este verde da 1.98:1 y no se permite |
| Error | `--color-danger` | `#F2545B` | Mensajes de validación (talla) |
| Acento por producto | `--accent` | ver §4.5 | Decorativo: número gigante, foco, borde de talla. Todos ≥ 4.5:1 sobre `#0B0B0C` (verificado) |

`src/styles/global.css` (base obligatoria):

```css
@import "tailwindcss";
@import "@fontsource-variable/big-shoulders-display";
@import "@fontsource-variable/manrope";

@theme {
  --color-bg: #0B0B0C;
  --color-surface: #151517;
  --color-surface-2: #1E1E21;
  --color-line: #2A2A2E;
  --color-ink: #ECECEC;
  --color-muted: #A1A1A8;
  --color-faint: #6B6B73;
  --color-silver: #C8C8CC;
  --color-wa: #25D366;
  --color-on-wa: #0B0B0C;
  --color-danger: #F2545B;

  --font-display: "Big Shoulders Display Variable", "Arial Narrow", sans-serif;
  --font-sans: "Manrope Variable", system-ui, sans-serif;

  --radius-card: 20px;
  --radius-sheet: 24px;
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
}

:root {
  --accent: var(--color-silver);
  /* escala z-index semántica */
  --z-sticky: 10;
  --z-header: 20;
  --z-fab: 30;
  --z-sheet: 40;
  --z-toast: 50;
  --z-intro: 60;
  color-scheme: dark;
}

html { background: var(--color-bg); color: var(--color-ink); font-family: var(--font-sans); -webkit-tap-highlight-color: transparent; }
body { min-height: 100svh; overflow-x: clip; }
h1, h2, h3 { font-family: var(--font-display); text-wrap: balance; }
p { text-wrap: pretty; max-width: 65ch; }
:focus-visible { outline: 2px solid var(--color-ink); outline-offset: 3px; border-radius: 6px; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; scroll-behavior: auto !important; }
}
```

> Si `@fontsource-variable/big-shoulders-display` no existe en npm, usa `@fontsource-variable/big-shoulders` (familia unificada) y ajusta el nombre de la familia en `--font-display`. Comprueba el nombre real con `pnpm view`.

### Tipografía

| Rol | Fuente | Tamaño | Peso |
|-----|--------|--------|------|
| Display (h1 hero) | Big Shoulders Display | `clamp(3.5rem, 16vw, 6rem)`, `line-height .9`, `letter-spacing -0.01em` | 900 |
| h2 de sección | Big Shoulders Display | `clamp(2.5rem, 10vw, 4.5rem)`, `line-height .95` | 900 |
| Título producto (hoja) | Big Shoulders Display | 40 px | 900 |
| Precio | Big Shoulders Display | 22 px tarjeta / 36 px hoja | 800 |
| Números gigantes (`bgText`) | Big Shoulders Display | `clamp(10rem, 55vw, 22rem)`, solo contorno | 900 |
| Cuerpo | Manrope | 16 px (nunca < 16 en párrafos), `line-height 1.6` | 400 |
| UI (chips, botones, nombre en tarjeta) | Manrope | 14-15 px | 600 |
| Etiquetas pequeñas (equipo, "RETRO") | Manrope | 12-13 px, uppercase, `letter-spacing .08em` | 700 |

Máximo 2 familias. El logo **nunca** se imita con una fuente: siempre se usa la imagen.

### Espaciado y layout
- Escala (px): 4, 8, 12, 16, 24, 32, 48, 64, 96. Ritmo variado: 96 px entre secciones grandes, 48 px en las internas.
- Gutter lateral: 16 px en móvil, 24 px en ≥ 768 px, 32 px en ≥ 1280 px. `max-width` del contenido: 1280 px.
- Radios: tarjeta 20 px, hoja 24 px arriba, chips y botones redondos completos, botón de pedido 16 px.
- Breakpoints Tailwind por defecto (`sm 640`, `md 768`, `lg 1024`, `xl 1280`). **Diseñar a 375 px primero.**
- Objetivos táctiles ≥ 44 × 44 px (tallas 48 × 48).

### Estilo de componentes
Oscuro, cinematográfico, con poco borde y mucha luz: la profundidad sale de focos `radial-gradient` y sombras de suelo, no de tarjetas con borde. Sin glassmorphism (excepto el header), sin texto con degradado, sin bordes laterales de acento, sin emojis como iconos y sin "eyebrows" en mayúsculas encima de cada sección.

---

## 8. Autenticación y autorización

**No aplica.** No hay cuentas, login, pagos en línea ni datos personales almacenados. El sitio es 100 % estático y público. El único dato "sensible" es el número de WhatsApp de la tienda, que es público por diseño.

---

## 9. Orden de construcción

> Sigue los pasos en orden. Al terminar cada paso: `pnpm build` sin errores y commit con mensaje en español (`paso N: …`).

**Paso 1: Scaffolding**
```bash
pnpm create astro@latest hoopz-catalogo -- --template minimal --typescript strict --install --git
cd hoopz-catalogo
pnpm astro add tailwind            # Tailwind v4 vía @tailwindcss/vite
pnpm add gsap lenis zod @fontsource-variable/big-shoulders-display @fontsource-variable/manrope lucide-static
pnpm add -D sharp tsx vitest @playwright/test @astrojs/check typescript prettier prettier-plugin-astro
```
- `tsconfig.json`: `"strict": true`, alias `"@/*": ["src/*"]`.
- `astro.config.mjs`: `site: "https://hoopz.pages.dev"`, `trailingSlash: "never"`, `build: { format: "directory" }`, `image: { layout: "constrained" }` (si la versión lo soporta).
- Scripts en `package.json`:
  ```json
  {
    "dev": "astro dev",
    "build": "tsx scripts/check-data.ts && node scripts/make-og.mjs && astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "images": "python3 scripts/process-images.py",
    "check:data": "tsx scripts/check-data.ts",
    "deploy": "tsx scripts/check-data.ts --strict && pnpm build && wrangler pages deploy dist --project-name hoopz"
  }
  ```
- Entregable: proyecto que arranca con `pnpm dev`.

**Paso 2: Assets de marca y fotos**
- Copia `hoopz-assets/` (junto a este blueprint) a `assets-src/`. Copia `assets-src/logo/hoopz-logo.png` a `src/assets/brand/hoopz-logo.png`.
- Verifica que existan las 32 fotos de la lista de §4.5 (`images.front/back` + `.jpg`).
- Entregable: `assets-src/` completo y versionado.

**Paso 3: Recorte de fondo (pipeline de imágenes)**
- Las fotos están tomadas sobre una **sábana de cuadros blanco y negro**, con luz irregular, etiquetas colgando y, en algunas, un balón de peluche en el borde superior. Hay que aislar la prenda.
- `scripts/process-images.py` (Python 3.10+; `pip install "rembg[cpu]" pillow`):
  1. Para cada `assets-src/fotos/*.jpg`: `rembg.remove()` con sesión `new_session("birefnet-general")` (si falla la descarga del modelo, usa `"isnet-general-use"`) y `alpha_matting=True`.
  2. Quedarse solo con el **componente conectado más grande** del canal alfa (elimina el balón de peluche y restos de la sábana). Umbral alfa 16.
  3. Recortar al bounding box del alfa y añadir padding transparente del 6 %. Lienzo final **4:5** con la prenda centrada y la base alineada al 94 % de la altura (todas las prendas "pisan" la misma línea).
  4. Redimensionar a 1600 px de alto y guardar PNG en `src/assets/products/<mismo-nombre>.png`.
  5. **No alterar los colores de la prenda.** Solo se permite un `ImageOps.autocontrast(cutoff=0.5)` muy leve sobre la luminancia si la foto está claramente lavada.
- `scripts/contact-sheet.py`: genera `tmp/contact-sheet.png` con los 32 recortes sobre `#0B0B0C` en una cuadrícula de 8 columnas. **Míralo** (lee la imagen) y revisa cada recorte: bordes con cuadros de sábana, partes de la prenda comidas (sobre todo jerseys blancos sobre cuadros blancos: Rockets, 76ers, Wizards, Kobe) o etiquetas raras.
- Arreglo de recortes defectuosos: repetir ese archivo con `alpha_matting_foreground_threshold` 250 / `background_threshold` 5, o probar el otro modelo. Si un jersey blanco sigue mal, aplicar al recorte un `ImageFilter.MinFilter(3)` seguido de `MaxFilter(3)` sobre el alfa para cerrar huecos. Documenta en `README.md` qué ajuste necesitó cada archivo.
- Los PNG generados **se versionan** (el build no depende de Python).
- Entregable: 32 PNG transparentes revisados visualmente.

**Paso 4: Datos y validación**
- Crea `src/data/schema.ts`, `src/data/store.ts` y `src/data/products.ts` **exactamente** como en §4.2, §4.4 y §4.5.
- `src/lib/catalog.ts`: **modo test**: si `import.meta.env.PUBLIC_TEST_FIXTURES === "1"`, usa `whatsapp = "580000000000"` y rellena los productos sin datos con `price: 35` y `sizes: ["S","M","L","XL"]` (solo en memoria, nunca escribe los archivos). Luego valida, ordena (por categoría según `CATEGORIES` y luego por `order`), resuelve imágenes con `import.meta.glob` y expone `getProducts()`, `getProduct(slug)`, `countsByCategory()` y `featured()`.
- `src/lib/whatsapp.ts` y `src/lib/format.ts` (§5).
- `scripts/check-data.ts` (ejecutado con `tsx`, ya instalado en el Paso 1): importa `src/data/store.ts` y `src/data/products.ts` directamente. Imprime una tabla de pendientes: "WhatsApp: PENDIENTE", "Instagram: —", "Envíos: —", "Productos sin precio: 19/19", "Productos sin tallas: 19/19". Sin `--strict` siempre sale con código 0; con `--strict` sale con 1 si `whatsapp === "PENDIENTE"`.
- Entregable: `pnpm check:data` muestra los 5 pendientes.

**Paso 5: Tokens, layout base y fuentes**
- `global.css` como en §7.
- `BaseLayout.astro`: `<html lang="es-VE">`; en `<head>` un script inline **antes de todo** que añade la clase `js`: `document.documentElement.classList.add("js")`. Metadatos: title, description, canonical, `og:*` (type, title, description, image 1200×630, url, locale `es_VE`), `twitter:card=summary_large_image`, `theme-color #0B0B0C`, favicons. Precarga (`<link rel="preload">`) de la fuente display (woff2, peso 900 del subset latin). Analítica de Cloudflare solo si `cfAnalyticsToken`.
- Capa de grano (§6.5 J).
- Entregable: página vacía con fondo y tipografías correctas.

**Paso 6: Maquetación estática completa (sin animación)**
- Construye **todas** las secciones de §6.5 (A-I) en HTML/CSS, con todo el contenido visible y bien maquetado a 375, 768, 1024 y 1440 px. Intro todavía desactivada.
- `ProductCard` con `<Image>` (AVIF + WebP, `widths={[320, 480, 640]}`, `sizes="(min-width:1280px) 25vw, (min-width:768px) 33vw, 50vw"`); las 4 primeras con `loading="eager"` y el resto lazy. Hero: la primera prenda destacada con `fetchpriority="high"`.
- Iconos: SVG inline de `lucide-static` (`share-2`, `x`, `arrow-left`, `instagram`, `map-pin`, `truck`, `rotate-3d`). Glifo de WhatsApp en `icons/WhatsAppIcon.astro` (SVG de un solo path, `fill="currentColor"`).
- Páginas `p/[slug].astro` y `404.astro`.
- Todos los links de WhatsApp construidos con `lib/whatsapp.ts` (respetando §4.3).
- Entregable: sitio navegable y completo **sin JS**.

**Paso 7: Interactividad (sin motion todavía)**
- `ui/filter.ts`: chips, `?cat=`, conteo y estado ARIA (primero cambio instantáneo; Flip llega en el paso 9).
- `ui/sheet.ts`: `<dialog>`, datos del JSON, `pushState`/`popstate` (§6.2), cierre con X/Esc/fondo, bloqueo de scroll y botón de giro frente/espalda (primero sin animación: alterna caras).
- `ui/sizes.ts`: selección de talla → `href` del botón, validación "Elige una talla".
- `ui/share.ts` + toast (`role="status"`, z-index `--z-toast`, 2.5 s).
- Entregable: flujo completo tarjeta → hoja → talla → WhatsApp funcionando, incluido el botón atrás.

**Paso 8: Motion base (`scripts/main.ts`)**
- `gsap.registerPlugin(ScrollTrigger, SplitText, Flip, DrawSVGPlugin)`. Importa desde `gsap/ScrollTrigger`, `gsap/SplitText`, `gsap/Flip`, `gsap/DrawSVGPlugin`.
- `const mm = gsap.matchMedia()` con `{ motion: "(prefers-reduced-motion: no-preference)", fine: "(pointer: fine)", hover: "(hover: hover)" }`. Cada módulo recibe el contexto y devuelve su limpieza.
- `motion/smooth-scroll.ts` (Lenis, solo `fine && motion`).
- `motion/header.ts`, `motion/reveals.ts` (batch de tarjetas + SplitText del h2).
- Esperar `document.fonts.ready` antes de crear cualquier SplitText.
- Entregable: header que se oculta, tarjetas con revelado y scroll suave en desktop.

**Paso 9: Motion de momentos de marca**
- `motion/hero.ts`: DrawSVG de la cancha, SplitText del h1, ciclo de destacados con rodillo de números, flotación y parallax (§6.5 C).
- `motion/marquee.ts` (§6.5 D).
- Filtro con `Flip` (§6.5 E) y tilt en hover.
- Hoja: entrada/salida, arrastrar para cerrar y giro 3D frente/espalda (§6.5 F).
- `motion/how-to-order.ts` (§6.5 G), barrido de luz del logo en el footer y aparición del FAB (§6.5 H, I).
- Entregable: todos los momentos de motion de §6.5 salvo la intro.

**Paso 10: Intro**
- `Intro.astro` + `motion/intro.ts` exactamente como en §6.5 A. La pelota SVG se dibuja en el propio componente.
- Comprueba: segunda carga en la misma pestaña = sin intro; reduced motion = sin intro; tap = salta; JS deshabilitado = sin overlay.
- Entregable: intro ≤ 1.8 s, saltable.

**Paso 11: Imágenes OG y favicons (`scripts/make-og.mjs`)**
- Con sharp, para cada producto, un JPG de 1200×630 (calidad 82) en `public/og/<slug>.jpg`:
  - Fondo `#0B0B0C` con un foco radial del `accent` del producto (generado como SVG y rasterizado por sharp).
  - `bgText` gigante contorneado a la derecha (SVG `<text>` con `stroke`; la fuente Big Shoulders se incrusta en el SVG vía `@font-face` en base64 desde `node_modules/@fontsource-variable/…/files/*.woff2`).
  - Recorte de la prenda (espalda si existe) a la derecha, de 560 px de alto.
  - Logo HOOPZ a la izquierda (220 px), y debajo el nombre del producto en Manrope 700 a 44 px, color `#ECECEC`.
- `public/og/default.jpg`: logo centrado más 3 prendas destacadas en abanico.
- Favicons: recorte cuadrado de la pelota del logo (región central superior del PNG, aprox. x 370-650, y 130-410 de la imagen 1024) en `favicon.png` (48 px) y `apple-touch-icon.png` (180 px), sobre `#0B0B0C`.
- El script se salta los archivos que ya existen y son más nuevos que sus fuentes (cache por `mtime`).
- Entregable: pegar `/p/heat-butler-22` en WhatsApp debe mostrar esa prenda (se verifica tras el deploy, Paso 15).

**Paso 12: Accesibilidad y pulido**
- Revisa: orden de foco, `aria-label` en botones de icono, `alt` descriptivos (`"Jersey Miami Heat de Jimmy Butler, número 22, azul Vice, vista de espalda"`), contraste, objetivos táctiles, sin scroll horizontal a 375 px y `lang="es-VE"`.
- Usa la skill `impeccable` (`/impeccable audit` y luego `/impeccable polish`) y `emil-design-eng` para revisar el timing de cada animación.
- Entregable: sin hallazgos P0/P1.

**Paso 13: Tests**
- Unit (Vitest), `tests/unit/whatsapp.test.ts`:
  - `productWhatsAppUrl` con talla y precio → decodificado contiene "Jersey Heat · Jimmy Butler #22", "Talla: M", "Precio: $35" y la URL `/p/heat-butler-22`.
  - Con `price: null` omite la línea de precio; con `size: null` dice "te la confirmo por aquí".
  - `whatsapp: "PENDIENTE"` → `null`.
  - Retro incluye la temporada: "Jersey Lakers · Kobe Bryant #24 (2009-10)". Sixers: el sufijo es "76ers".
- `tests/unit/data.test.ts`: los conteos de §4.5, slugs únicos, 3 destacados, todos los `accent` ≥ 4.5:1 sobre `#0B0B0C` (implementa la fórmula de luminancia WCAG en el test) y que todas las imágenes referenciadas existan.
- E2E (Playwright, proyecto `Mobile Chrome` con viewport 390×844 y otro desktop), `tests/e2e/catalog.spec.ts`. En `playwright.config.ts`, `webServer.command = "PUBLIC_TEST_FIXTURES=1 astro build --outDir dist-test && astro preview --outDir dist-test --port 4322"` (así los tests tienen WhatsApp, precios y tallas de prueba sin tocar los datos reales). Añade `dist-test/` a `.gitignore`. Escenarios:
  1. La home carga sin errores de consola, con 19 tarjetas.
  2. El filtro "Retro" deja 3 tarjetas visibles y la URL pasa a `?cat=retro`; "Todo" vuelve a 19.
  3. Tocar una tarjeta abre el `<dialog>`, la URL cambia a `/p/<slug>`, `page.goBack()` cierra la hoja y la URL vuelve a `/`.
  4. Con tallas definidas: "Pedir por WhatsApp" sin talla no navega y muestra "Elige una talla"; tras elegir talla, el `href` contiene la talla codificada.
  5. Cargar `/p/lakers-bryant-24` directamente muestra el detalle y `og:image` termina en `/og/lakers-bryant-24.jpg`.
  6. `emulateMedia({ reducedMotion: "reduce" })`: sin intro y contenido visible de inmediato.
  7. Con JS deshabilitado (`javaScriptEnabled: false`): las tarjetas son links funcionales y no hay overlay.
  8. A 375 px de ancho: `document.documentElement.scrollWidth <= 375`.
- Entregable: `pnpm test` y `pnpm test:e2e` en verde.

**Paso 14: Rendimiento**
- `pnpm build && pnpm preview` y Lighthouse móvil (Chrome DevTools o `npx lighthouse http://localhost:4321 --preset=perf --form-factor=mobile --throttling-method=simulate`). Objetivos de §1.
- Revisa: GSAP cargado solo desde `main.ts` (un único bundle); que no haya imágenes eager fuera de las 4 primeras + hero; tamaño de los AVIF (< 70 KB a 640 w); `will-change` solo durante animaciones; ScrollTriggers limpiados en `mm.revert()`.
- Entregable: Performance ≥ 90, Accessibility ≥ 95, CLS < 0.05.

**Paso 15: Deploy a Cloudflare Pages**
- Crea un repo en GitHub y haz push. En Cloudflare: Workers & Pages → Create → Pages → Connect to Git → selecciona el repo. Build command: `pnpm build`; output: `dist`; variable `NODE_VERSION=22`. Nombre del proyecto: `hoopz` (URL `https://hoopz.pages.dev`; si está ocupado, usa `hoopz-ve` y actualiza `store.siteUrl` y `site` en `astro.config.mjs`).
- Alternativa sin Git: `pnpm dlx wrangler login` y luego `pnpm deploy`.
- **Mientras `whatsapp` siga PENDIENTE no se publica en producción.** Se puede publicar una vista previa (`wrangler pages deploy dist --branch preview`) para que el dueño la revise.
- Tras publicar: pega la URL de la home y la de un producto en WhatsApp y comprueba la vista previa. Si WhatsApp guardó una vista previa vieja, añade `?v=2` al link de prueba.
- Entregable: sitio público + `README.md` con la URL.

**Paso 16: Guía para el dueño y verificación final**
- Escribe `COMO-ACTUALIZAR.md` en español sencillo:
  - Cómo poner el número de WhatsApp (formato 58 + número sin 0, con ejemplo).
  - Cómo cambiar un precio o las tallas (editar `src/data/products.ts` desde la web de GitHub → "Commit changes" → Cloudflare publica solo en ~1 min).
  - Cómo marcar algo como agotado (`soldOut: true`).
  - Cómo agregar un producto nuevo: foto derecha sobre fondo liso, con luz pareja y sin flash → ponerla en `assets-src/fotos/<slug>-frente.jpg` → `pnpm images` → copiar un bloque en `products.ts` → `pnpm build`. Indica que este paso necesita una computadora con Python, o pedírselo al desarrollador.
- Usa la skill `run` para levantar el sitio y recorrer el flujo completo en el navegador. Usa `review` si se trabaja con PR.
- Entregable: guía + verificación final con capturas a 390 px y 1440 px.

---

## 10. Configuración del entorno

### Requisitos
- Node.js 22 LTS y pnpm 9+ (`corepack enable`).
- Python 3.10+ con `pip` (solo para el Paso 3 y para agregar productos en el futuro).
- Cuenta gratuita de Cloudflare y de GitHub (Paso 15).

### Variables de entorno
No hay secretos. Todo vive en `src/data/store.ts`.

| Variable | Descripción | Dónde obtenerla |
|----------|-------------|-----------------|
| `NODE_VERSION` | `22`, en la configuración de build de Cloudflare Pages | — |
| `PUBLIC_TEST_FIXTURES` | `1` solo en el build de tests E2E: inyecta WhatsApp/precios/tallas ficticios en memoria | — |

### Comandos iniciales
```bash
pnpm install
pnpm images          # solo la primera vez (o al añadir fotos); requiere Python + rembg
pnpm check:data
pnpm dev
```

---

## 11. Dependencias

### Producción
| Paquete | Propósito |
|---------|-----------|
| `astro` | Framework y generación estática |
| `@tailwindcss/vite`, `tailwindcss` | Estilos (instalados por `astro add tailwind`) |
| `gsap` | Motion: core + ScrollTrigger + SplitText + Flip + DrawSVGPlugin (todos incluidos y gratuitos) |
| `lenis` | Scroll suave en desktop |
| `zod` | Validación de datos |
| `@fontsource-variable/big-shoulders-display` | Fuente display self-hosted |
| `@fontsource-variable/manrope` | Fuente de texto self-hosted |
| `lucide-static` | Iconos SVG |

### Desarrollo
| Paquete | Propósito |
|---------|-----------|
| `sharp` | Imágenes OG y favicons |
| `tsx` | Ejecutar `scripts/check-data.ts` |
| `vitest` | Tests unitarios |
| `@playwright/test` | E2E (Chromium ya disponible en el entorno si `PLAYWRIGHT_BROWSERS_PATH` está definido; no ejecutes `playwright install` si existe) |
| `@astrojs/check`, `typescript` | `astro check` |
| `prettier`, `prettier-plugin-astro` | Formato |
| `wrangler` (vía `pnpm dlx`) | Deploy opcional por CLI |

Python (fuera de npm): `rembg[cpu]`, `pillow`.

---

## 12. Estrategia de despliegue

### Hosting
Cloudflare Pages: estático, gratis (incluido uso comercial), CDN global con buena latencia hacia Venezuela y HTTPS automático.

### CI/CD
- Integración Git de Cloudflare Pages: cada push a `main` publica en producción y cada rama genera una URL de vista previa.
- Opcional: GitHub Action con `pnpm check && pnpm test && pnpm build` en cada PR.

### Dominio y DNS
Arranca en `https://hoopz.pages.dev`. Para un dominio propio (ej. `hoopz.shop`): Pages → Custom domains → seguir el asistente; después actualizar `store.siteUrl` y `site` y redeploy (las URLs de los mensajes de WhatsApp y las OG dependen de ellos).

### Entornos
- **Desarrollo:** `pnpm dev`.
- **Vista previa:** ramas o `--branch preview` (se pueden publicar con datos PENDIENTE).
- **Producción:** `main`, solo con `pnpm check:data --strict` en verde.

---

## 13. Estrategia de testing

### Unit
Vitest. Cubre `lib/whatsapp.ts`, `lib/format.ts` y la integridad de datos (§9, Paso 13).

### Integración
`astro check` (tipos) + validación zod en build (falla si los datos son inválidos o falta una imagen).

### E2E
Playwright, móvil (390×844) y desktop (1440×900). Los 8 escenarios de §9 Paso 13. Se ejecutan antes de cada deploy a producción.

### Manual (obligatorio antes de entregar)
- Hoja de contacto de recortes revisada (Paso 3).
- Prueba real en un teléfono Android con "Slow 4G" en DevTools: intro, filtro, hoja, botón atrás y WhatsApp abriendo con el mensaje correcto.
- Vista previa del link en WhatsApp (home y un producto).

---

## 14. Skills para usar durante la construcción

| Skill | Cuándo | Por qué |
|-------|--------|---------|
| `impeccable` | Pasos 6, 9 y 12 (`craft` para secciones, `audit` + `polish` al final) | Jerarquía, layout, accesibilidad y anti-patrones de UI |
| `ui-ux-pro-max` | Paso 5 | Verificar tokens, contraste y reglas de toque/móvil |
| `emil-design-eng` | Pasos 9-10 | Afinar timing, curvas y la sensación de cada animación (hoja, giro, filtro, intro) |
| `run` | Pasos 7, 12 y 16 | Levantar el sitio y comprobar el flujo real en el navegador |
| `review` | Paso 16, si el trabajo se entrega como PR | Revisión del PR antes de fusionar |

---

## 15. CLAUDE.md del proyecto

```markdown
# HOOPZ Catálogo

Catálogo web de una sola página, mobile-first y con motion graphics para HOOPZ, tienda de jerseys NBA en Aragua, Venezuela. Los pedidos se cierran por WhatsApp. Toda la interfaz está en español (Venezuela).

## Comandos
- `pnpm dev` — servidor de desarrollo (http://localhost:4321)
- `pnpm build` — check-data + OG + build estático en `dist/`
- `pnpm preview` — sirve `dist/`
- `pnpm check` — `astro check` (tipos)
- `pnpm test` — Vitest
- `pnpm test:e2e` — Playwright (móvil + desktop)
- `pnpm images` — recorta fondos de `assets-src/fotos/` → `src/assets/products/` (Python + rembg)
- `pnpm check:data` — lista datos PENDIENTES (`--strict` falla si falta el WhatsApp)
- `pnpm deploy` — check estricto + build + Cloudflare Pages

## Stack
Astro (estático) + TypeScript strict + Tailwind v4 + GSAP (ScrollTrigger, SplitText, Flip, DrawSVG) + Lenis + zod + Cloudflare Pages. Sin React, sin backend, sin base de datos.

## Arquitectura
- `src/data/store.ts`, `src/data/products.ts` — ÚNICA fuente de datos (editada por el dueño). Validada con `src/data/schema.ts` en build.
- `src/lib/` — `catalog.ts` (carga/valida/ordena), `whatsapp.ts` (URLs wa.me), `format.ts`.
- `src/components/` — un componente `.astro` por sección/elemento. `ProductDetail` se reutiliza en la hoja (`<dialog>`) y en `/p/[slug]`.
- `src/scripts/main.ts` — único punto de entrada de JS de cliente; registra plugins GSAP y crea `gsap.matchMedia()`. Módulos en `scripts/motion/` (animación) y `scripts/ui/` (interacción).
- Flujo: tarjeta = `<a href="/p/slug">` → JS intercepta → abre `<dialog>` + `pushState` → `popstate` cierra. Sin JS, navega a la página estática.
- Los datos para la hoja se serializan en `<script type="application/json" id="catalog-data">` en build (URLs de imagen ya optimizadas con `getImage`).
- `src/assets/products/*.png` son recortes generados por `scripts/process-images.py` y SE VERSIONAN.

## Reglas de código
1. Un componente por archivo, máx. 250 líneas. Scripts de cliente máx. 200 líneas por módulo.
2. Alias `@/` → `src/`. Sin barrel exports.
3. JS de cliente solo desde `src/scripts/main.ts` (un bundle). Nada de `<script is:inline>` salvo el que añade la clase `js` en `<head>`.
4. Todo motion dentro de `gsap.matchMedia()` con `(prefers-reduced-motion: no-preference)` y con limpieza.
5. Contenido visible por defecto: animar con `gsap.from()` desde JS, nunca ocultar con CSS esperando a JS.
6. Solo `transform`, `opacity`, `clip-path`, `filter` y `mask` en animaciones. Nunca width/height/top/left.
7. Todos los links de WhatsApp salen de `lib/whatsapp.ts`. Nunca escribir `wa.me` a mano en componentes.

## Sistema de diseño
- Colores: bg `#0B0B0C`, surface `#151517`, surface-2 `#1E1E21`, line `#2A2A2E`, ink `#ECECEC`, muted `#A1A1A8`, faint `#6B6B73` (nunca texto), silver `#C8C8CC`, wa `#25D366` con texto `#0B0B0C` (nunca blanco), danger `#F2545B`. `--accent` por producto (en products.ts).
- Tipografía: Big Shoulders Display 800-900 (títulos, precios, números gigantes) + Manrope (texto, UI). Cuerpo ≥ 16 px. Máx. 2 familias.
- Radios: tarjeta 20 px, hoja 24 px, chips/botones redondos. Gutter 16/24/32 px. Max-width 1280 px.
- Curvas: `expo.out` entradas, `power3.inOut` estados. Micro 150-250 ms, revelados 600-900 ms. Prohibido `elastic`/`back` (excepto `bounce.out` en la pelota de la intro).
- Estética: arena de noche, prendas recortadas bajo foco de luz, número gigante contorneado detrás. Interfaz monocromática; el color lo ponen las prendas.
- Prohibido: texto con degradado, glassmorphism decorativo (solo el header), bordes laterales de acento, emojis como iconos, eyebrows en mayúsculas sobre cada sección, animaciones infinitas llamativas (solo la flotación sutil del hero y la marquesina).
- z-index: sticky 10, header 20, fab 30, sheet 40, toast 50, intro 60.

## Datos pendientes
WhatsApp, Instagram, envíos, precios y tallas pueden estar en `PENDIENTE`/`null`. La UI DEBE funcionar así (ver blueprint §4.3). Nunca inventes estos valores.

## Variables de entorno
Ninguna secreta. `NODE_VERSION=22` en Cloudflare. `PUBLIC_TEST_FIXTURES=1` solo en el build de E2E (datos ficticios en memoria).

## Reglas No Negociables
1. Mobile-first: diseña y prueba a 375-390 px antes que desktop. Cero scroll horizontal.
2. `prefers-reduced-motion` respetado en todo; la intro nunca bloquea ni se repite en la sesión.
3. Rendimiento: Lighthouse móvil ≥ 90; imágenes con `<Image>` (AVIF/WebP), solo 4 tarjetas + hero en eager.
4. No inventar precios, tallas, número de WhatsApp ni datos de envío. No publicar en producción con WhatsApp PENDIENTE.
5. No usar logos de la NBA, de equipos, de Nike ni de Adidas como gráficos de la interfaz; solo aparecen en las fotos de producto. No escribir "original" ni "oficial" en los textos salvo confirmación del dueño.
6. No alterar los colores de las prendas en el procesamiento de imágenes.
7. Botón atrás de Android cierra la hoja de producto, nunca saca del catálogo.
```

---

## 16. Reglas No Negociables

1. **Mobile-first real:** todo se diseña y verifica primero a 375-390 px; cero scroll horizontal; objetivos táctiles ≥ 44 px.
2. **Contenido primero, motion después:** sin JS o con reduced motion, el catálogo se ve y funciona completo. La intro dura ≤ 1.8 s, es saltable y aparece una vez por sesión.
3. **Cero datos inventados:** precios, tallas, WhatsApp, Instagram y envíos quedan `PENDIENTE`/`null` hasta que el dueño los entregue; la UI degrada como indica §4.3; no hay deploy a producción con WhatsApp pendiente.
4. **Un solo origen para WhatsApp:** todas las URLs salen de `lib/whatsapp.ts` (`https://wa.me/<58…>?text=<encodeURIComponent>`), con producto, talla, precio y link del producto.
5. **Rendimiento para datos móviles venezolanos:** Lighthouse móvil ≥ 90, un único bundle JS, imágenes AVIF/WebP lazy y fuentes self-hosted.
6. **Contraste verificado:** texto ≥ 4.5:1; el texto sobre el verde de WhatsApp es siempre `#0B0B0C`.
7. **Marca:** el logo HOOPZ se usa siempre como imagen y nunca se recrea con fuentes. No se usan logos de terceros (NBA, equipos, Nike, Adidas) como elementos de diseño.
8. **Fotos fieles:** el recorte de fondo no cambia los colores de las prendas; cada recorte se revisa visualmente en la hoja de contacto.
9. **Navegación nativa:** la hoja es un `<dialog>` con historial (`/p/<slug>`), el botón atrás la cierra y cada producto tiene su página estática con vista previa propia para WhatsApp.
10. **Idioma:** toda la interfaz, el código de contenido, la guía del dueño y los mensajes de commit en español.
