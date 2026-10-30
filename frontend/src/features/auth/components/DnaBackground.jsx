import { useEffect, useRef } from "react";

const STRAND = ["#005638", "#9bc53d"];
const RUNG = ["#005638", "#9bc53d"];

function createRandom(seed) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
}

export function DnaBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let helices = [];
    let animationFrame = 0;
    let lastFrame = 0;
    const layoutSeed = Math.floor(Math.random() * 2147483646) + 1;
    const startTime = performance.now();
    const frameInterval = 1000 / 30;

    const build = () => {
      const random = createRandom(layoutSeed);
      const count = Math.max(10, Math.min(34, Math.round((width * height) / 38000)));
      const columns = Math.ceil(Math.sqrt((count * width) / height));
      const rows = Math.ceil(count / columns);
      const jitterSpread = 0.77;
      const jitterInset = (1 - jitterSpread) / 2;

      helices = Array.from({ length: count }, (_, index) => {
        const centerX = ((index % columns) + jitterInset + random() * jitterSpread) / columns * width;
        const centerY = ((Math.floor(index / columns) % rows) + jitterInset + random() * jitterSpread) / rows * height;
        const depth = random();
        const scale = 0.55 + depth * 0.7;
        const gap = 11 * scale + 3;
        const length = (120 + random() * 180) * scale;

        return {
          x: centerX,
          y: centerY,
          rotation: random() * Math.PI,
          radius: 13 * scale,
          gap,
          pointCount: Math.max(8, Math.round(length / gap)),
          twist: 0.45 + random() * 0.15,
          speed: (0.12 + random() * 0.18) * (random() > 0.5 ? 1 : -1),
          phase: random() * 6.28,
          alpha: 0.18 + depth * 0.32,
        };
      });
    };

    const drawHelix = (helix, time) => {
      const points = [];
      for (let index = 0; index < helix.pointCount; index += 1) {
        const progress = index / (helix.pointCount - 1);
        const taper = Math.sin(Math.PI * progress) ** 0.6;
        const angle = index * helix.twist + time * helix.speed + helix.phase;
        points.push({
          x: (index - helix.pointCount / 2) * helix.gap,
          offset: Math.sin(angle) * helix.radius * taper,
          depth: Math.cos(angle),
        });
      }

      context.save();
      context.translate(helix.x, helix.y);
      context.rotate(helix.rotation);
      context.lineCap = "round";
      context.lineWidth = 1;

      context.globalAlpha = helix.alpha * 0.7;
      for (let strand = 0; strand < 2; strand += 1) {
        context.strokeStyle = STRAND[strand];
        context.beginPath();
        points.forEach((point, index) => {
          const y = strand ? -point.offset : point.offset;
          if (index) context.lineTo(point.x, y);
          else context.moveTo(point.x, y);
        });
        context.stroke();
      }

      context.globalAlpha = helix.alpha * 0.6;
      for (let strand = 0; strand < 2; strand += 1) {
        context.strokeStyle = RUNG[strand];
        context.beginPath();
        points.forEach((point, index) => {
          if ((index & 1) === strand) {
            context.moveTo(point.x, point.offset);
            context.lineTo(point.x, -point.offset);
          }
        });
        context.stroke();
      }

      context.globalAlpha = helix.alpha;
      for (let strand = 0; strand < 2; strand += 1) {
        context.fillStyle = STRAND[strand];
        context.beginPath();
        points.forEach((point) => {
          const y = strand ? -point.offset : point.offset;
          const depth = strand ? -point.depth : point.depth;
          const radius = 1.2 + (1.1 * (depth + 1)) / 2;
          context.moveTo(point.x + radius, y);
          context.arc(point.x, y, radius, 0, 6.2832);
        });
        context.fill();
      }
      context.restore();
    };

    const render = (time) => {
      context.clearRect(0, 0, width, height);
      helices.forEach((helix) => drawHelix(helix, time));
    };

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      build();
      if (reduceMotion) render(0);
    };

    const frame = (now) => {
      animationFrame = window.requestAnimationFrame(frame);
      if (now - lastFrame < frameInterval) return;
      lastFrame = now;
      render((now - startTime) / 1000);
    };

    window.addEventListener("resize", resize);
    resize();
    if (!reduceMotion) animationFrame = window.requestAnimationFrame(frame);

    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0 block h-full w-full" aria-hidden="true" />;
}

export default DnaBackground;
