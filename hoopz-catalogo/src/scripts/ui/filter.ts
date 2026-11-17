import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersMotion, scrollToEl } from "../state";
import { checkRadio } from "./radiogroup";

const VALID = new Set(["todo", "actuales", "retro", "chaquetas", "entrenamiento"]);

export function initFilter() {
  const group = document.querySelector<HTMLElement>("[data-filters]");
  const grid = document.querySelector<HTMLElement>("[data-grid]");
  if (!group || !grid) return;
  const cards = [...grid.querySelectorAll<HTMLElement>("[data-card]")];
  const count = document.querySelector<HTMLElement>("[data-count]");
  const bar = document.querySelector<HTMLElement>("[data-filterbar]")!;

  function apply(cat: string, animate: boolean) {
    const btn = group!.querySelector<HTMLElement>(`[data-filter="${cat}"]`);
    if (!btn) return;
    checkRadio(group!, btn);
    const show = (c: HTMLElement) => cat === "todo" || c.dataset.category === cat;
    const total = cards.filter(show).length;
    // lo que aún no se reveló con el scroll se muestra ya (evita casilleros apagados tras filtrar)
    document.dispatchEvent(new CustomEvent("hoopz:reveal-all"));

    if (animate && prefersMotion()) {
      const st = Flip.getState(cards);
      const before = grid!.offsetHeight;
      cards.forEach((c) => (c.hidden = !show(c)));
      const after = grid!.offsetHeight;
      // Flip saca las tarjetas del flujo: la altura fija evita que la sección siguiente se monte encima
      gsap.fromTo(grid, { height: before }, { height: after, duration: 0.6, ease: "power3.inOut", clearProps: "height" });
      Flip.from(st, {
        duration: 0.6,
        ease: "power3.inOut",
        stagger: 0.02,
        absolute: true,
        onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.4, ease: "power3.out" }),
        onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.92, duration: 0.25, ease: "power2.in" }),
        onComplete: () => ScrollTrigger.refresh(),
      });
      if (count) {
        const o = { n: Number(count.textContent) };
        gsap.to(o, { n: total, duration: 0.4, ease: "power2.out", onUpdate: () => (count.textContent = String(Math.round(o.n))) });
      }
    } else {
      cards.forEach((c) => (c.hidden = !show(c)));
      if (count) count.textContent = String(total);
      ScrollTrigger.refresh();
    }
  }

  group.addEventListener("click", (e) => {
    const btn = (e.target as Element).closest<HTMLElement>("[data-filter]");
    if (!btn || btn.getAttribute("aria-checked") === "true") return;
    const cat = btn.dataset.filter!;
    apply(cat, true);
    const url = new URL(location.href);
    if (cat === "todo") url.searchParams.delete("cat");
    else url.searchParams.set("cat", cat);
    history.replaceState(history.state, "", url);
    if (grid.getBoundingClientRect().top < 0) scrollToEl(grid, -bar.offsetHeight - 70);
  });

  const initial = new URLSearchParams(location.search).get("cat");
  if (initial && VALID.has(initial)) apply(initial, false);
}
