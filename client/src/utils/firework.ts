// client/src/utils/firework.ts
// Lightweight fireworks/confetti (no extra deps)

export type FireworkOptions = {
  x?: number;
  y?: number;
  colors?: string[];
  count?: number;   // number of particles
  spread?: number;  // max distance in px
  zIndex?: number;
};

export function firework(opts: FireworkOptions = {}) {
  if (typeof window === "undefined") return;

  const {
    x = window.innerWidth / 2,
    y = window.innerHeight / 2,
    colors = ["#ff5252", "#ffb300", "#00c853", "#40c4ff", "#ab47bc"],
    count = 24,
    spread = 120,
    zIndex = 9999,
  } = opts;

  const container = document.createElement("div");
  Object.assign(container.style, {
    position: "fixed",
    left: "0",
    top: "0",
    width: "0",
    height: "0",
    zIndex: String(zIndex),
  });
  document.body.appendChild(container);

  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    Object.assign(p.style, {
      position: "fixed",
      left: `${x}px`,
      top: `${y}px`,
      width: "6px",
      height: "6px",
      borderRadius: "50%",
      pointerEvents: "none",
      background: colors[i % colors.length],
    });

    const angle = (Math.PI * 2 * i) / count;
    const distance = spread * (0.6 + Math.random() * 0.6);
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;

    const anim = p.animate(
      [
        { transform: "translate(0,0)", opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px)`, opacity: 0 },
      ],
      {
        duration: 900 + Math.random() * 400,
        easing: "cubic-bezier(.2,.8,.2,1)",
        fill: "forwards",
      }
    );
    anim.onfinish = () => p.remove();
    container.appendChild(p);
  }

  setTimeout(() => container.remove(), 1500);
}

// Make both default and named imports work
export default firework;
export const fireworks = firework;
export function launchFirework(o?: FireworkOptions) { return firework(o); }
