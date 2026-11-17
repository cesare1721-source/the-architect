import { gsap } from "gsap";
import { prefersMotion } from "../state";
import { checkRadio } from "./radiogroup";
import { toast } from "./toast";

/** Talla elegida por producto (se conserva al cerrar y reabrir la hoja). */
const chosen = new Map<string, string>();
const detailOf = (el: Element) => el.closest<HTMLElement>("[data-detail]");

function selectSize(btn: HTMLElement) {
  const detail = detailOf(btn)!;
  checkRadio(btn.closest('[role="radiogroup"]')!, btn);
  chosen.set(detail.dataset.slug!, btn.dataset.size!);
  const order = detail.querySelector<HTMLAnchorElement>("[data-order]");
  if (order && !order.hasAttribute("data-wa-pending")) order.href = btn.dataset.wa!;
  const msg = detail.querySelector("[data-size-msg]");
  if (msg) msg.textContent = "";
}

/** Restaura la talla elegida en un detalle recién clonado. */
export function restoreDetail(detail: HTMLElement) {
  const size = chosen.get(detail.dataset.slug!);
  const btn = size && detail.querySelector<HTMLElement>(`[data-size="${CSS.escape(size)}"]`);
  if (btn) selectSize(btn);
}

function requireSize(order: HTMLElement, e: Event) {
  const detail = detailOf(order)!;
  if (!order.hasAttribute("data-needs-size") || chosen.has(detail.dataset.slug!)) return false;
  e.preventDefault();
  e.stopImmediatePropagation();
  const group = detail.querySelector<HTMLElement>("[data-sizes]")!;
  detail.querySelector("[data-size-msg]")!.textContent = "Elige una talla para continuar";
  group.scrollIntoView({ block: "center", behavior: prefersMotion() ? "smooth" : "auto" });
  group.querySelector<HTMLElement>('[role="radio"]')?.focus({ preventScroll: true });
  group.style.outlineColor = "var(--accent)";
  setTimeout(() => (group.style.outlineColor = ""), 1000);
  return true;
}

/** Voltea el cromo (frente ↔ reverso). */
export function flip(detail: HTMLElement) {
  const card = detail.querySelector<HTMLElement>("[data-flipper]");
  const btn = detail.querySelector<HTMLElement>("[data-flip]");
  const label = detail.querySelector("[data-flip-label]");
  if (!card) return;
  const toBack = card.dataset.side !== "back";
  card.dataset.side = toBack ? "back" : "front";
  if (label) label.textContent = toBack ? "Ver frente" : (btn?.dataset.backLabel ?? "Ver espalda");
  if (prefersMotion()) {
    gsap.fromTo(card, { "--ry": toBack ? "0deg" : "180deg" }, { "--ry": toBack ? "180deg" : "0deg", duration: 0.8, ease: "power3.inOut", clearProps: "--ry" });
  }
}

async function share(btn: HTMLElement) {
  const url = btn.dataset.url!;
  try {
    if (navigator.share) return await navigator.share({ title: btn.dataset.title, url });
    await navigator.clipboard.writeText(url);
    toast("Link copiado");
  } catch (err) {
    if ((err as DOMException).name !== "AbortError") toast("No se pudo compartir");
  }
}

/**
 * Inclinación del cromo con el dedo o el mouse + brillo holográfico.
 * Tocar sin arrastrar = voltear.
 */
function initTilt() {
  type Tilt = { rx: gsap.QuickToFunc; ry: gsap.QuickToFunc };
  const cache = new WeakMap<HTMLElement, Tilt>();
  const tiltOf = (el: HTMLElement): Tilt => {
    let t = cache.get(el);
    if (!t) {
      t = { rx: gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power3" }), ry: gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power3" }) };
      cache.set(el, t);
    }
    return t;
  };
  const track = (el: HTMLElement, cx: number, cy: number) => {
    const r = el.getBoundingClientRect();
    const px = Math.min(1, Math.max(0, (cx - r.left) / r.width));
    const py = Math.min(1, Math.max(0, (cy - r.top) / r.height));
    if (prefersMotion()) {
      const t = tiltOf(el);
      t.rx((0.5 - py) * 22);
      t.ry((px - 0.5) * 26);
    }
    for (const f of el.querySelectorAll<HTMLElement>("[data-foil], [data-glare]")) {
      f.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
      f.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
      f.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
      f.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
    }
  };
  const settle = (el: HTMLElement) => {
    const t = tiltOf(el);
    t.rx(0);
    t.ry(0);
  };
  let active: { el: HTMLElement; x0: number; y0: number; moved: boolean } | null = null;
  document.addEventListener("pointerdown", (e) => {
    const el = (e.target as Element).closest<HTMLElement>("[data-tilt]");
    if (!el) return;
    active = { el, x0: e.clientX, y0: e.clientY, moved: false };
    track(el, e.clientX, e.clientY);
  });
  document.addEventListener("pointermove", (e) => {
    if (active) {
      if (Math.hypot(e.clientX - active.x0, e.clientY - active.y0) > 8) active.moved = true;
      return track(active.el, e.clientX, e.clientY);
    }
    if (e.pointerType !== "mouse") return; // desktop: reacciona al pasar el mouse
    const el = (e.target as Element).closest<HTMLElement>("[data-tilt]");
    if (el) track(el, e.clientX, e.clientY);
  });
  const end = (tap: boolean) => {
    if (!active) return;
    if (tap && !active.moved) flip(detailOf(active.el)!); // tocar sin arrastrar = voltear
    settle(active.el);
    active = null;
  };
  document.addEventListener("pointerup", () => end(true));
  document.addEventListener("pointercancel", () => end(false));
  document.addEventListener(
    "pointerout",
    (e) => {
      const el = (e.target as Element).closest?.<HTMLElement>("[data-tilt]");
      if (el && e.pointerType === "mouse" && !el.contains(e.relatedTarget as Node)) settle(el);
    },
    true,
  );
}

export function initDetails() {
  document.addEventListener(
    "click",
    (e) => {
      const t = e.target as Element;
      const size = t.closest<HTMLElement>("[data-size]");
      if (size) return selectSize(size);
      const order = t.closest<HTMLElement>("[data-order]");
      if (order && requireSize(order, e)) return;
      const flipBtn = t.closest("[data-flip]");
      if (flipBtn) return flip(detailOf(flipBtn)!);
      const shareBtn = t.closest<HTMLElement>("[data-share]");
      if (shareBtn) void share(shareBtn);
    },
    { capture: true },
  );
  // WhatsApp sin configurar: el botón avisa en lugar de navegar
  document.addEventListener("click", (e) => {
    if ((e.target as Element).closest("[data-wa-pending]")) {
      e.preventDefault();
      toast("WhatsApp aún no configurado");
    }
  });
  initTilt();
}
