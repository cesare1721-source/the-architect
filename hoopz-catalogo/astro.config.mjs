// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://hoopz.pages.dev",
  trailingSlash: "never",
  // CSS inline: evita una petición que bloquea el render en redes móviles lentas
  build: { format: "directory", inlineStylesheets: "always" },
  vite: { plugins: [tailwindcss()] },
});
