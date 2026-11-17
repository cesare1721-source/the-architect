import { gsap } from "gsap";

/**
 * Salto inicial (≤ 1.9 s, saltable, una vez por sesión): dos reflectores barren la arena y se
 * cruzan sobre el logo; luego la arena se abre como dos puertas.
 * Si el JS llega tarde (> 1.4 s, red lenta), el logo ya apareció por CSS: solo barrido y salida.
 */
export function initIntro() {
  const html = document.documentElement;
  const el = document.querySelector<HTMLElement>("[data-intro]");
  const finish = () => {
    try {
      sessionStorage.setItem("hoopz-intro", "1");
    } catch {}
    html.classList.remove("intro-pending");
    el?.remove();
    document.dispatchEvent(new Event("hoopz:intro-done"));
  };
  if (!el || !html.classList.contains("intro-pending")) return el?.remove();
  if (performance.now() > 2600) return finish(); // la red de seguridad CSS ya la está ocultando

  const logo = el.querySelector<HTMLElement>("[data-intro-logo]")!;
  const [coneL, coneR] = [el.querySelector('[data-cone="left"]'), el.querySelector('[data-cone="right"]')];
  const [doorT, doorB] = [el.querySelector('[data-door="top"]'), el.querySelector('[data-door="bottom"]')];
  const sweep = el.querySelector("[data-sweep]");
  el.style.animation = "none";
  logo.style.animation = "none";
  const full = performance.now() < 1400;
  const tl = gsap.timeline({ onComplete: finish });

  if (full) {
    gsap.set(logo, { opacity: 1, clipPath: "inset(48% 0% 48% 0%)", filter: "blur(10px)", scale: 1.06 });
    tl.fromTo(coneL, { rotation: -58, opacity: 0 }, { rotation: -14, opacity: 1, duration: 0.75, ease: "power2.inOut" }, 0)
      .fromTo(coneR, { rotation: 58, opacity: 0 }, { rotation: 14, opacity: 1, duration: 0.75, ease: "power2.inOut" }, 0.05)
      .to(logo, { clipPath: "inset(0% 0% 0% 0%)", filter: "blur(0px)", scale: 1, duration: 0.7, ease: "expo.out" }, 0.45);
  } else {
    gsap.to(logo, { opacity: 1, duration: 0.2 });
  }
  tl.fromTo(sweep, { backgroundPosition: "100% 0" }, { backgroundPosition: "0% 0", duration: 0.45, ease: "power2.inOut" }, full ? 0.95 : 0)
    .to([coneL, coneR], { opacity: 0, duration: 0.35, ease: "power1.out" }, ">-0.05")
    .to(logo, { y: -24, opacity: 0, duration: 0.35, ease: "power2.in" }, "<")
    .to(doorT, { yPercent: -100, duration: 0.55, ease: "power3.inOut" }, "<0.1")
    .to(doorB, { yPercent: 100, duration: 0.55, ease: "power3.inOut" }, "<");

  const skip = () => tl.progress(1);
  el.addEventListener("pointerdown", skip, { once: true });
  addEventListener("keydown", skip, { once: true });
}
