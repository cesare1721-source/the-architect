import { expect, test, type Page } from "@playwright/test";

const skipIntro = (page: Page) => page.addInitScript(() => sessionStorage.setItem("hoopz-intro", "1"));
const lockers = (page: Page) => page.locator("[data-grid] [data-card]:not([hidden])");
const sheet = (page: Page) => page.locator("dialog[data-sheet]");

test.describe("catálogo", () => {
  test.beforeEach(async ({ page }) => skipIntro(page));

  test("carga sin errores y con 19 casilleros", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    await expect(lockers(page)).toHaveCount(19);
    await expect(page.locator("h1")).toContainText(/Viste/i);
    expect(errors).toEqual([]);
  });

  test("la alineación titular presenta a los 5 y el contador avanza con el scroll", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[data-player]")).toHaveCount(5);
    const stage = page.locator("[data-stage]");
    await expect(stage).toHaveClass(/is-pinned/);
    await stage.scrollIntoViewIfNeeded();
    const count = page.locator("[data-bug-count]");
    await expect(count).toHaveText("01");
    const vh = await page.evaluate(() => innerHeight);
    await page.mouse.wheel(0, vh * 2.2);
    await expect(count).not.toHaveText("01", { timeout: 4000 });
  });

  test("el filtro Leyendas deja 3 y actualiza la URL", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("radio", { name: /Leyendas/ }).click();
    await expect(lockers(page)).toHaveCount(3);
    await expect(page).toHaveURL(/\?cat=retro$/);
    await page.getByRole("radio", { name: /Todo/ }).click();
    await expect(lockers(page)).toHaveCount(19);
  });

  test("?cat= preselecciona el filtro", async ({ page }) => {
    await page.goto("/?cat=chaquetas");
    await expect(lockers(page)).toHaveCount(2);
  });

  test("al filtrar, la sección siguiente no se monta sobre los casilleros", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("radio", { name: /Leyendas/ }).click();
    await page.waitForTimeout(800);
    await page.getByRole("radio", { name: /Todo/ }).click();
    for (let i = 0; i < 6; i++) {
      await page.waitForTimeout(100);
      const gap = await page.evaluate(() => document.querySelector("#la-jugada")!.getBoundingClientRect().top - document.querySelector("[data-grid]")!.getBoundingClientRect().bottom);
      expect(gap).toBeGreaterThanOrEqual(0);
    }
  });

  test("el casillero abre el cromo, cambia la URL y atrás lo cierra", async ({ page }) => {
    await page.goto("/");
    await page.locator('[data-grid] a[data-open-sheet="heat-butler-22"]').click();
    await expect(sheet(page)).toBeVisible();
    await expect(page).toHaveURL(/\/p\/heat-butler-22$/);
    await expect(sheet(page).getByRole("heading", { name: "Jimmy Butler" })).toBeVisible();
    await page.goBack();
    await expect(sheet(page)).toBeHidden();
    await expect(page).toHaveURL(/\/$/);
  });

  test("el cromo se voltea (botón) y muestra la espalda", async ({ page }) => {
    await page.goto("/");
    await page.locator('[data-grid] a[data-open-sheet="celtics-bird-33"]').click();
    const card = sheet(page).locator("[data-flipper]");
    await sheet(page).getByRole("button", { name: "Ver espalda" }).click();
    await expect(card).toHaveAttribute("data-side", "back");
    await page.waitForTimeout(1000);
    const m11 = await card.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m11);
    expect(m11).toBeLessThan(-0.9); // rotateY(180deg)
  });

  test("pedir sin talla avisa; con talla el link la lleva", async ({ page }) => {
    await page.goto("/");
    await page.locator('[data-grid] a[data-open-sheet="lakers-bryant-24"]').click();
    const order = sheet(page).locator("[data-order]");
    await order.click();
    await expect(sheet(page).locator("[data-size-msg]")).toHaveText("Elige una talla para continuar");
    await expect(page).toHaveURL(/\/p\/lakers-bryant-24$/);
    await sheet(page).getByRole("radio", { name: "L", exact: true }).click();
    const href = decodeURIComponent((await order.getAttribute("href"))!);
    expect(href).toContain("https://wa.me/580000000000");
    expect(href).toContain("Jersey Lakers · Kobe Bryant #24 (2009-10)");
    expect(href).toContain("Talla: L");
  });

  test("página de producto con su OG", async ({ page }) => {
    await page.goto("/p/lakers-bryant-24");
    await expect(page.locator("h1")).toHaveText("Kobe Bryant");
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/og\/lakers-bryant-24\.jpg$/);
  });

  test("sin scroll horizontal", async ({ page }) => {
    await page.goto("/");
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  });
});

test("reducir movimiento: sin intro, sin escena fija, todo visible", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("[data-intro]")).toHaveCount(0);
  await expect(page.locator("[data-stage]")).not.toHaveClass(/is-pinned/);
  await expect(page.locator("[data-player]").nth(4)).toBeVisible();
  await expect(lockers(page).first()).toBeVisible();
});

test("la intro aparece una vez y se puede saltar", async ({ page }) => {
  await page.goto("/");
  await page.mouse.click(10, 10);
  await expect(page.locator("[data-intro]")).toHaveCount(0, { timeout: 4000 });
  await page.reload();
  await expect(page.locator("[data-intro]")).toHaveCount(0);
});

test.describe("sin JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("los casilleros son links y no hay velo", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[data-intro]")).toBeHidden();
    await page.locator('[data-grid] a[data-open-sheet="chaqueta-thunder"]').click();
    await expect(page).toHaveURL(/\/p\/chaqueta-thunder$/);
    await expect(page.locator("h1")).toHaveText("Chaqueta Thunder");
  });
});
