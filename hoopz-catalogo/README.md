# HOOPZ · Catálogo v2 «Noche de juego»

Catálogo web de una sola página, mobile-first y con motion graphics, para **HOOPZ** (jerseys NBA, Aragua, Venezuela). Se comparte por WhatsApp y los pedidos se cierran por WhatsApp con el mensaje ya escrito.

> ¿Eres el dueño? Para poner el WhatsApp, los precios o las tallas, lee [COMO-ACTUALIZAR.md](./COMO-ACTUALIZAR.md).

## El concepto

Todo el sitio es una **transmisión de noche de juego**:

| Escena | Qué pasa |
|---|---|
| **Salto inicial** | Dos reflectores barren la arena, se cruzan y bañan el logo; la arena se abre como dos puertas. Una vez por sesión, se salta con un toque |
| **Portada** | «Viste el juego» + un abanico con los 5 titulares |
| **Alineación titular** | Escena fija controlada por el scroll: cada titular entra como en TV (barrido del color del equipo, número gigante, nombre letra a letra, rótulo con precio). Un gesto = un jugador |
| **Cinta EN VIVO** | Corre sola; el scroll la acelera y le cambia el sentido |
| **El vestuario** | 19 casilleros con placa de cinta. La luz se enciende con parpadeo de fluorescente al llegar y las prendas se balancean con la velocidad del scroll. Filtro animado |
| **El cromo** | Ficha como barajita coleccionable: se inclina con el dedo, brillo holográfico, tocar = voltear (espalda + ficha técnica) |
| **La jugada** | El «cómo pedir» como jugada de pizarra; los pases de tiza se dibujan con el scroll |
| **Cierre** | «¿Falta tu equipo?» + WhatsApp + logo con barrido de luz |

Sin JavaScript o con «reducir movimiento» activado, todo se ve y funciona: las escenas se muestran estáticas y apiladas.

## Puesta en marcha

```bash
pnpm install
pnpm check:data   # qué datos faltan
pnpm dev          # http://localhost:4321
```

| Comando | Qué hace |
|---|---|
| `pnpm build` | Revisa datos, genera marca/OG si hace falta y construye `dist/` |
| `pnpm preview` | Sirve `dist/` con gzip en el puerto 4321 |
| `pnpm test` | 12 tests unitarios (WhatsApp, datos, contraste de colores, alineación) |
| `pnpm test:e2e` | 13 escenarios en móvil y desktop (26 pruebas) con datos ficticios |
| `pnpm images [nombre…]` | Recorta el fondo de `assets-src/fotos/*.jpg` con rembg (`pip install "rembg[cpu]" pillow`) |

## Publicar en Cloudflare Pages

Conecta el repo en **Workers & Pages → Create → Pages → Connect to Git**. Directorio raíz `hoopz-catalogo`, build `pnpm build`, salida `dist`, variable `NODE_VERSION=22`. Las imágenes OG, los recortes y los favicons están versionados: el build no necesita Python ni navegador.

**No publiques en producción mientras el WhatsApp diga `PENDIENTE`.**

## Fotos

- 15 productos usan las fotos mejoradas con Google Flow, recortadas sobre el fondo del sitio.
- Grizzlies Morant, Celtics Tatum, Mavericks Irving y Wizards Poole usan la foto original: la versión con IA cambiaba colores o detalles de la prenda.
- Originales en `assets-src/fotos-originales/`, fuentes de los recortes en `assets-src/fotos/`.

## Calidad medida

Lighthouse móvil (simulación "Slow 4G"), build de producción servido con gzip:

| Página | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
|---|---|---|---|---|
| `/` | 87-90 | 100 | 100 | 100 |
| `/p/celtics-bird-33` | 97 | 100 | 100 | 100 |

En el inicio, el LCP simulado es de 3.3 s; medido en Chrome real con la CPU 4× más lenta (red local), el LCP llega a ~0.3 s. CLS 0. Peso inicial ~500 KB.

Tests: `pnpm check` 0 errores · `pnpm test` 12/12 · `pnpm test:e2e` 26/26.

Arquitectura y reglas en [CLAUDE.md](./CLAUDE.md).
