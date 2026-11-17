# HOOPZ Catálogo (v2)

Catálogo web de una sola página, mobile-first, con motion graphics, para HOOPZ (jerseys NBA, Aragua, Venezuela). Pedidos por WhatsApp. Interfaz en español (Venezuela). Concepto: **noche de juego** (transmisión deportiva + vestuario).

## Comandos
- `pnpm dev` · `pnpm build` (check-data + marca/OG + build) · `pnpm preview` (sirve `dist/` con gzip en :4321)
- `pnpm check` (tipos) · `pnpm test` (Vitest) · `pnpm test:e2e` (Playwright móvil + desktop sobre `dist-test/` con datos ficticios)
- `pnpm images [nombres]` (rembg: `assets-src/fotos/` → `src/assets/products/`) · `pnpm check:data` (`--strict` falla sin WhatsApp)

Node ≥ 22.12, pnpm con `allowBuilds` en `pnpm-workspace.yaml`. Playwright fijado a 1.63 (coincide con el Chromium del entorno).

## Stack
Astro 7 (estático) + TypeScript strict + Tailwind v4 + GSAP 3.15 (ScrollTrigger, SplitText, Flip, DrawSVG) + Lenis (solo desktop) + zod 4. Sin framework de UI, sin backend.

## Escenas (src/components)
- `Intro` — reflectores que se cruzan sobre el logo; la arena se abre en dos puertas. Una vez por sesión, saltable, ≤ 1.9 s, con red de seguridad CSS.
- `Lineup` — portada (abanico de los 5 titulares) + **alineación titular**: escena fija (pin) controlada por el scroll, snap de un titular por gesto (`inertia: false`). Sin motion: fichas apiladas.
- `Ticker` — cinta EN VIVO; la velocidad del scroll la acelera.
- `Vestuario` + `LockerCard` + `FilterBar` — casilleros con placa de cinta (`plate`), luz que parpadea al llegar y prendas que se balancean con la velocidad del scroll. Filtro con GSAP Flip (altura del grid fija durante la animación).
- `Cromo` — ficha como barajita coleccionable: inclinación con dedo/mouse, brillo holográfico (`--mx/--my`), tocar = voltear (reverso con espalda + ficha). Se reutiliza en la hoja (`ProductSheet`, un `<dialog>` que clona `<template>`) y en `/p/[slug]`.
- `Jugada` — "cómo pedir" como jugada de pizarra; pases de tiza dibujados con el scroll.
- `Cierre` — CTA final + logo con barrido de luz.

## Reglas de motion
1. Todo dentro de `gsap.matchMedia()` (`src/scripts/main.ts`), con la condición `always: "all"` para que el callback corra siempre.
2. El contenido es visible sin JS; el estado oculto inicial lo pone el JS. La imagen LCP (jersey central del abanico) entra solo con transform, nunca con opacidad.
3. No usar `translate` de CSS en elementos que anime GSAP (lo anula con `translate: none`): centrar con `inset-inline` + `margin-inline: auto`.
4. Una sola línea de tiempo por escena con scroll; no mezclar con animaciones independientes sobre los mismos elementos.
5. Curvas: `expo.out` entradas, `power3.inOut` cambios de estado. UI < 300 ms; momentos de marca hasta ~1.2 s. Botones: `press` (scale .97).
6. Inicialización escalonada (escena principal primero, el resto en `requestIdleCallback`).

## Sistema visual
bg `#08080A` · surface `#121215` · line `#26262C` · ink `#F2F2F2` · muted `#A3A3AD` · silver `#C8C8CC` · tape `#ECEBE4` · gold `#E8C46A` · live `#C8102E` (fondo de EN VIVO) · danger `#FF6B76` (texto de error) · wa `#25D366` con texto `#08080A`. `--accent` por producto (≥ 4.5:1, lo verifica un test).
Big Shoulders Display (títulos, números) + Manrope (texto). `broadcast` = única voz en mayúsculas espaciadas (rótulos de TV).

## Datos
`src/data/store.ts` y `src/data/products.ts` (validados con zod en `src/lib/catalog.ts`). WhatsApp, Instagram, envíos, precios y tallas pueden estar PENDIENTES: la UI lo maneja. Nunca inventarlos.

## Reglas No Negociables
1. Mobile-first (375-390 px) y cero scroll horizontal.
2. `prefers-reduced-motion` y sin-JS: todo legible y usable.
3. No inventar precios, tallas ni WhatsApp; no publicar con WhatsApp PENDIENTE.
4. No usar logos de NBA/equipos/marcas como gráficos de interfaz; no decir "original/oficial".
5. No alterar los colores de las prendas. Grizzlies, Tatum, Mavericks y Wizards usan la foto original (la versión con IA cambiaba la prenda).
6. El botón atrás de Android cierra la hoja de producto.
