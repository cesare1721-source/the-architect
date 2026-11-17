let timer: number | undefined;

export function toast(msg: string) {
  const el = document.querySelector<HTMLElement>("#toast .toast-msg");
  if (!el) return;
  el.textContent = msg;
  el.classList.remove("opacity-0", "translate-y-2");
  clearTimeout(timer);
  timer = window.setTimeout(() => el.classList.add("opacity-0", "translate-y-2"), 2500);
}
