import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

/**
 * Portada + "Alineación titular": cada titular se presenta como en una transmisión.
 * El scroll controla la línea de tiempo (scrub) y se detiene en cada jugador (snap).
 *   cambio de jugador = barrido diagonal del color del equipo, el número entra de golpe,
 *   el jersey cruza la pantalla, el nombre sube letra a letra y el rótulo se despliega.
 */
export function initLineup() {
  const root = document.querySelector<HTMLElement>("[data-lineup]");
  if (!root) return;
  const cleanups: (() => void)[] = [];
  cleanups.push(cover(root));
  const stage = root.querySelector<HTMLElement>("[data-stage]")!;
  const players = gsap.utils.toArray<HTMLElement>("[data-player]", stage);
  if (!players.length) return;

  stage.classList.add("is-pinned");
  cleanups.push(() => stage.classList.remove("is-pinned"));

  const parts = players.map((pl) => ({
    el: pl,
    wash: pl.querySelector("[data-wash]")!,
    num: pl.querySelector("[data-num]")!,
    jersey: pl.querySelector("[data-jersey]")!,
    label: pl.querySelector("[data-lower] .broadcast")!,
    nameEl: pl.querySelector("[data-name]")!,
    name: SplitText.create(pl.querySelector("[data-name]"), { type: "chars", mask: "lines" }),
    bar: pl.querySelector("[data-bar]")!,
  }));
  cleanups.push(() => parts.forEach((p) => p.name.revert()));

  const HIDDEN_WASH = "polygon(115% 0%, 115% 0%, 100% 100%, 100% 100%)";
  const FULL_WASH = "polygon(-15% 0%, 115% 0%, 100% 100%, -30% 100%)";

  // estado inicial: solo se ve el primer titular (y aún sin presentar)
  parts.forEach((p, i) => {
    gsap.set(p.el, { autoAlpha: i === 0 ? 1 : 0 });
    gsap.set(p.wash, { clipPath: i === 0 ? FULL_WASH : HIDDEN_WASH });
    gsap.set(p.num, { scale: 1.7, autoAlpha: 0, filter: "blur(12px)" });
    gsap.set(p.jersey, { xPercent: 40, rotation: 10, autoAlpha: 0 });
    gsap.set(p.name.chars, { yPercent: 115 });
    gsap.set(p.nameEl, { autoAlpha: 0 });
    gsap.set([p.label, p.bar], { clipPath: "inset(0% 100% 0% 0%)" });
  });

  /** Presentación de un jugador (posición en la línea de tiempo `at`). */
  const present = (tl: gsap.core.Timeline, p: (typeof parts)[number], at: number) =>
    tl
      .to(p.num, { scale: 1, autoAlpha: 1, filter: "blur(0px)", duration: 0.5, ease: "expo.out" }, at)
      .to(p.jersey, { xPercent: 0, rotation: 0, autoAlpha: 1, duration: 0.6, ease: "expo.out" }, at + 0.05)
      .to(p.nameEl, { autoAlpha: 1, duration: 0.1 }, at + 0.15)
      .to(p.name.chars, { yPercent: 0, duration: 0.45, stagger: 0.02, ease: "expo.out" }, at + 0.15)
      .to([p.label, p.bar], { clipPath: "inset(0% 0% 0% 0%)", duration: 0.45, stagger: 0.08, ease: "power3.out" }, at + 0.25);

  // Toda la escena en una sola línea de tiempo controlada por el scroll: al llegar, el snap
  // presenta al primer titular; cada gesto siguiente pasa al próximo; al volver, todo se deshace.
  const tl = gsap.timeline({ defaults: { ease: "none" } });
  const HOLD = 1;
  present(tl, parts[0]!, 0);
  tl.addLabel("p0", 1.1);
  parts.forEach((p, i) => {
    if (i === 0) return;
    const prev = parts[i - 1]!;
    const t = 1.1 + HOLD + (i - 1) * (1 + HOLD); // el cambio dura 1 y luego se mantiene HOLD
    tl.set(p.el, { autoAlpha: 1 }, t)
      .to(p.wash, { clipPath: FULL_WASH, duration: 0.7, ease: "power2.inOut" }, t)
      .to(prev.jersey, { xPercent: -45, rotation: -10, autoAlpha: 0, duration: 0.5, ease: "power2.in" }, t)
      .to(prev.num, { scale: 1.35, autoAlpha: 0, duration: 0.45, ease: "power2.in" }, t)
      .to([prev.label, prev.bar], { clipPath: "inset(0% 0% 0% 100%)", duration: 0.35, ease: "power2.in" }, t)
      .to(prev.name.chars, { yPercent: -115, duration: 0.35, stagger: 0.01, ease: "power2.in" }, t)
      .to(prev.nameEl, { autoAlpha: 0, duration: 0.1 }, t + 0.3);
    present(tl, p, t + 0.35);
    tl.addLabel(`p${i}`, t + 1);
  });
  tl.to({}, { duration: HOLD * 0.6 }); // respiro final antes de soltar la escena

  const count = root.querySelector<HTMLElement>("[data-bug-count]");
  const segs = gsap.utils.toArray<HTMLElement>("[data-bug-seg] > span", root);
  const labelTimes = parts.map((_, i) => tl.labels[`p${i}`]!);
  let current = -1;
  const setCurrent = (i: number) => {
    if (i === current) return;
    current = i;
    if (count) count.textContent = String(i + 1).padStart(2, "0");
    segs.forEach((s, k) => gsap.to(s, { scaleX: k <= i ? 1 : 0, duration: 0.3, ease: "power2.out", overwrite: true }));
  };

  const st = ScrollTrigger.create({
    trigger: stage,
    start: "top top",
    end: () => `+=${players.length * 80}%`,
    pin: true,
    scrub: 0.6,
    animation: tl,
    // sin inercia: un gesto rápido avanza un titular, no salta hasta el último
    snap: { snapTo: "labelsDirectional", inertia: false, duration: { min: 0.25, max: 0.7 }, delay: 0.05, ease: "power2.inOut" },
    onUpdate: () => {
      const time = tl.time();
      let i = 0;
      labelTimes.forEach((lt, k) => {
        if (time >= lt - 0.5) i = k;
      });
      setCurrent(i);
    },
  });
  setCurrent(0);
  cleanups.push(() => {
    st.kill();
    tl.kill();
  });
  return () => cleanups.forEach((c) => c());
}

/** Entrada de la portada (tras la intro) y salida con el scroll. */
function cover(root: HTMLElement) {
  const el = root.querySelector<HTMLElement>("[data-cover]")!;
  const title = SplitText.create(el.querySelector("[data-cover-title]"), { type: "chars", mask: "lines" });
  const fades = el.querySelectorAll("[data-cover-fade]");
  const fan = gsap.utils.toArray<HTMLElement>("[data-fan-item] > picture", el);
  // el abanico se abre desde el centro hacia afuera
  const fromCenter = [2, 1, 3, 0, 4].map((i) => fan[i]).filter(Boolean) as HTMLElement[];

  gsap.set(title.chars, { yPercent: 115 });
  gsap.set(fades, { autoAlpha: 0, y: 14 });
  gsap.set(fromCenter, { yPercent: 35, autoAlpha: 0 });

  const enter = gsap
    .timeline({ paused: true, defaults: { ease: "expo.out" } })
    .to(title.chars, { yPercent: 0, duration: 0.9, stagger: 0.03 }, 0)
    .to(fromCenter, { yPercent: 0, autoAlpha: 1, duration: 1, stagger: 0.08 }, 0.15)
    .to(fades, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08 }, 0.4);
  const start = () => enter.play();
  if (document.documentElement.classList.contains("intro-pending")) document.addEventListener("hoopz:intro-done", start, { once: true });
  else start();

  // al bajar, el abanico se hunde y se apaga: la escena siguiente toma el relevo
  const leave = gsap.to(fan, {
    yPercent: 18,
    autoAlpha: 0.15,
    ease: "none",
    scrollTrigger: { trigger: el, start: "center center", end: "bottom top", scrub: true },
  });
  return () => {
    enter.kill();
    leave.scrollTrigger?.kill();
    leave.kill();
    title.revert();
  };
}
