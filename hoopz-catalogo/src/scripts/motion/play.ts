import { gsap } from "gsap";

/** La jugada: los pases de tiza se dibujan con el scroll y encienden cada paso. */
export function initPlay() {
  const sec = document.querySelector<HTMLElement>("[data-play]");
  if (!sec) return;
  const passes = sec.querySelectorAll("[data-pass]");
  const marks = gsap.utils.toArray<SVGGElement>("[data-mark]", sec);
  const steps = gsap.utils.toArray<HTMLElement>("[data-step]", sec);
  gsap.set(passes, { drawSVG: "0%" });
  gsap.set(marks, { scale: 0.6, opacity: 0, transformOrigin: "50% 50%" });
  const tl = gsap
    .timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: sec.querySelector("[data-play-svg]"), start: "top 80%", end: "bottom 45%", scrub: 0.5 } })
    .to(marks[0]!, { scale: 1, opacity: 1, duration: 0.15 })
    .to(passes[0]!, { drawSVG: "100%", duration: 0.4 })
    .to(marks[1]!, { scale: 1, opacity: 1, duration: 0.15 })
    .to(passes[1]!, { drawSVG: "100%", duration: 0.4 })
    .to(marks[2]!, { scale: 1, opacity: 1, duration: 0.15 });
  // cada paso se enciende cuando aparece su marca en la pizarra (y se apaga al volver arriba)
  const sync = () => {
    const t = tl.time();
    [0.05, 0.55, 1.1].forEach((at, i) => steps[i]?.classList.toggle("is-on", t >= at));
  };
  tl.eventCallback("onUpdate", sync);
  return () => {
    tl.scrollTrigger?.kill();
    tl.kill();
    steps.forEach((s) => s.classList.remove("is-on"));
  };
}
