import { gsap } from "gsap";
import { lockScroll, prefersMotion } from "../state";
import { restoreDetail } from "./detail";

const isDesktop = () => matchMedia("(min-width: 768px)").matches;

export function initSheet() {
  const dialog = document.querySelector<HTMLDialogElement>("[data-sheet]");
  if (!dialog) return; // en la página de producto los links navegan normalmente
  const body = dialog.querySelector<HTMLElement>("[data-sheet-body]")!;
  const scroller = dialog.querySelector<HTMLElement>("[data-sheet-scroll]")!;
  const handle = dialog.querySelector<HTMLElement>("[data-sheet-handle]")!;
  let lastFocus: HTMLElement | null = null;
  let closing = false;

  function open(slug: string, push: boolean) {
    const tpl = document.querySelector<HTMLTemplateElement>(`template[data-detail-template="${CSS.escape(slug)}"]`);
    if (!tpl) return false;
    body.replaceChildren(tpl.content.cloneNode(true));
    const detail = body.querySelector<HTMLElement>("[data-detail]")!;
    restoreDetail(detail);
    dialog!.setAttribute("aria-label", detail.dataset.label ?? "Detalle del producto");
    lastFocus = document.activeElement as HTMLElement;
    gsap.killTweensOf(dialog);
    gsap.set(dialog, { clearProps: "transform,opacity" });
    dialog!.showModal();
    scroller.scrollTop = 0;
    lockScroll(true);
    if (push) history.pushState({ sheet: slug }, "", `/p/${slug}`);
    if (prefersMotion()) {
      if (isDesktop()) gsap.from(dialog, { y: 40, opacity: 0, duration: 0.45, ease: "expo.out" });
      else gsap.from(dialog, { yPercent: 100, duration: 0.55, ease: "expo.out" });
      // el cromo entra girando; se anima su contenedor para no pisar la inclinación ni el giro
      const tilt = detail.querySelector<HTMLElement>("[data-tilt]");
      if (tilt?.parentElement) {
        gsap.from(tilt.parentElement, { y: 50, scale: 0.9, opacity: 0, duration: 0.7, delay: 0.08, ease: "expo.out", clearProps: "transform,opacity" });
        gsap.from(tilt, { rotationY: -35, rotationX: 8, duration: 1.1, delay: 0.08, ease: "expo.out" });
        const foil = tilt.querySelector<HTMLElement>("[data-foil]");
        if (foil) gsap.fromTo(foil, { "--mx": "0%", "--my": "0%" }, { "--mx": "60%", "--my": "45%", duration: 1.2, delay: 0.15, ease: "power2.out" });
      }
    }
    return true;
  }

  function animateClose() {
    if (!dialog!.open || closing) return;
    closing = true;
    const done = () => {
      dialog!.close();
      gsap.set(dialog, { clearProps: "transform,opacity" });
      body.replaceChildren();
      lockScroll(false);
      closing = false;
      lastFocus?.focus({ preventScroll: true });
    };
    if (!prefersMotion()) return done();
    if (isDesktop()) gsap.to(dialog, { y: 30, opacity: 0, duration: 0.25, ease: "power3.in", onComplete: done });
    else gsap.to(dialog, { yPercent: 100, duration: 0.3, ease: "power3.in", onComplete: done });
  }

  /** Cierre pedido por el usuario: si la hoja añadió una entrada al historial, se vuelve atrás. */
  function close() {
    if (history.state?.sheet) history.back();
    else {
      animateClose();
      if (location.pathname !== "/") history.replaceState(null, "", "/" + location.search);
    }
  }

  document.addEventListener("click", (e) => {
    const me = e as MouseEvent;
    if (me.defaultPrevented || me.button !== 0 || me.metaKey || me.ctrlKey || me.shiftKey || me.altKey) return;
    const link = (e.target as Element).closest<HTMLElement>("a[data-open-sheet]");
    if (!link || dialog.contains(link)) return;
    if (open(link.dataset.openSheet!, true)) e.preventDefault();
  });

  window.addEventListener("popstate", (e) => {
    const slug = (e.state as { sheet?: string } | null)?.sheet;
    if (slug && !dialog.open) open(slug, false);
    else if (!slug && dialog.open) animateClose();
  });

  dialog.querySelector("[data-sheet-close]")!.addEventListener("click", close);
  dialog.addEventListener("cancel", (e) => {
    e.preventDefault(); // Esc
    close();
  });
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) close(); // tap en el fondo
  });

  // Arrastrar hacia abajo para cerrar (móvil): por distancia o por velocidad
  let startY = 0;
  let startT = 0;
  let dragging = false;
  handle.addEventListener("pointerdown", (e) => {
    if (isDesktop() || (e.target as Element).closest("button")) return;
    dragging = true;
    startY = e.clientY;
    startT = performance.now();
    handle.setPointerCapture(e.pointerId);
  });
  handle.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dy = e.clientY - startY;
    gsap.set(dialog, { y: dy > 0 ? dy : dy * 0.2 }); // hacia arriba, con fricción
  });
  const end = (e: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    const dy = e.clientY - startY;
    if (dy > 120 || dy / (performance.now() - startT) > 0.5) close();
    else gsap.to(dialog, { y: 0, duration: 0.3, ease: "power3.out" });
  };
  handle.addEventListener("pointerup", end);
  handle.addEventListener("pointercancel", end);
}
