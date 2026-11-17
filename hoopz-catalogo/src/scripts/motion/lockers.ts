import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Vestuario: al llegar a cada casillero su luz se enciende con parpadeo de fluorescente y la
 * prenda cae en su gancho y se asienta. Con el scroll, las prendas visibles se balancean
 * según la velocidad (física de péndulo amortiguado).
 */
export function initLockers() {
  const cards = gsap.utils.toArray<HTMLElement>("[data-grid] [data-card]");
  if (!cards.length) return;
  const parts = (c: HTMLElement) => ({
    light: c.querySelector("[data-light]"),
    glow: c.querySelector("[data-glow]"),
    swing: c.querySelector<HTMLElement>("[data-swing]"),
  });

  // solo se apagan los que aún no se ven (los de arriba quedan como están)
  const pending = cards.filter((c) => c.getBoundingClientRect().top > innerHeight * 0.92);
  for (const c of pending) {
    const p = parts(c);
    gsap.set(c, { opacity: 0, y: 28 }); // solo opacidad: siguen siendo enfocables
    gsap.set([p.light, p.glow], { opacity: 0.08 });
    gsap.set(p.swing, { y: -26, rotation: -6 });
  }
  const revealed = new WeakSet<HTMLElement>(cards.filter((c) => !pending.includes(c)));

  const reveal = (batch: Element[], instant = false) => {
    const todo = (batch as HTMLElement[]).filter((c) => !revealed.has(c));
    todo.forEach((c) => revealed.add(c));
    if (!todo.length) return;
    if (instant) return gsap.set(todo.flatMap((c) => [c, ...Object.values(parts(c))]), { clearProps: "opacity,transform" });
    todo.forEach((c, i) => {
      const p = parts(c);
      const d = i * 0.08;
      gsap.to(c, { opacity: 1, y: 0, duration: 0.5, delay: d, ease: "expo.out" });
      // parpadeo de fluorescente al encenderse
      gsap.to([p.light, p.glow], { keyframes: { opacity: [0.08, 1, 0.2, 0.9, 0.35, 1] }, duration: 0.7, delay: d + 0.1, ease: "none" });
      // la prenda cae y se asienta con un vaivén que se apaga
      gsap.to(p.swing, { y: 0, duration: 0.5, delay: d + 0.1, ease: "power3.out" });
      gsap.to(p.swing, { keyframes: { rotation: [-6, 4, -2.2, 1, 0] }, duration: 1.3, delay: d + 0.1, ease: "power1.out" });
    });
  };
  const batch = ScrollTrigger.batch(pending, { start: "top 90%", once: true, onEnter: (b) => reveal(b) });
  const revealAll = () => reveal(cards, true);
  document.addEventListener("hoopz:reveal-all", revealAll);
  const onFocus = (e: FocusEvent) => {
    const c = (e.target as Element).closest?.<HTMLElement>("[data-card]");
    if (c) reveal([c]);
  };
  document.addEventListener("focusin", onFocus);

  // vaivén por velocidad de scroll (solo prendas visibles y ya presentadas)
  const visible = new Set<HTMLElement>();
  const io = new IntersectionObserver((entries) => entries.forEach((en) => (en.isIntersecting ? visible.add(en.target as HTMLElement) : visible.delete(en.target as HTMLElement))));
  cards.forEach((c) => io.observe(c));
  let settleCall: gsap.core.Tween | null = null;
  const sway = ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => {
      const v = self.getVelocity();
      if (Math.abs(v) < 150) return;
      const swings = [...visible].filter((c) => revealed.has(c) && !gsap.isTweening(parts(c).swing)).map((c) => parts(c).swing);
      if (!swings.length) return;
      const r = gsap.utils.clamp(-7, 7, -v / 260);
      gsap.to(swings, { rotation: r, duration: 0.35, ease: "power2.out", overwrite: true });
      settleCall?.kill();
      settleCall = gsap.delayedCall(0.18, () => gsap.to(swings, { keyframes: { rotation: [r, -r * 0.5, r * 0.22, 0] }, duration: 1.2, ease: "power1.out", overwrite: true }));
    },
  });

  return () => {
    batch.forEach((t) => t.kill());
    sway.kill();
    io.disconnect();
    document.removeEventListener("hoopz:reveal-all", revealAll);
    document.removeEventListener("focusin", onFocus);
  };
}
