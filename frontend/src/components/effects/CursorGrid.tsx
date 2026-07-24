import { useEffect, useRef } from 'react';

type Falloff = 'linear' | 'smooth' | 'sharp';

export interface CursorGridProps {
  cellSize?: number;
  color?: string;
  radius?: number;
  falloff?: Falloff;
  holdTime?: number;
  fadeDuration?: number;
  lineWidth?: number;
  maxOpacity?: number;
  fillOpacity?: number;
  gridOpacity?: number;
  cellRadius?: number;
  clickPulse?: boolean;
  pulseSpeed?: number;
  className?: string;
}

interface GridConfig {
  cellSize: number;
  color: string;
  radius: number;
  falloff: Falloff;
  holdTime: number;
  fadeDuration: number;
  lineWidth: number;
  maxOpacity: number;
  fillOpacity: number;
  gridOpacity: number;
  cellRadius: number;
  clickPulse: boolean;
  pulseSpeed: number;
}

interface Pulse {
  x: number;
  y: number;
  startedAt: number;
}

const FALLOFF_CURVES: Record<Falloff, (value: number) => number> = {
  linear: (value) => value,
  smooth: (value) => value * value * (3 - 2 * value),
  sharp: (value) => value * value * value,
};

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace('#', '');
  const value =
    normalized.length === 3
      ? normalized
          .split('')
          .map((character) => character + character)
          .join('')
      : normalized;
  const numeric = Number.parseInt(value.slice(0, 6), 16);
  return [(numeric >> 16) & 255, (numeric >> 8) & 255, numeric & 255];
}

export function CursorGrid({
  cellSize = 70,
  color = '#ffffff',
  radius = 140,
  falloff = 'smooth',
  holdTime = 400,
  fadeDuration = 800,
  lineWidth = 1.2,
  maxOpacity = 1,
  fillOpacity = 0,
  gridOpacity = 0,
  cellRadius = 0,
  clickPulse = true,
  pulseSpeed = 600,
  className = '',
}: CursorGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef<GridConfig>({} as GridConfig);
  const wakeRef = useRef<(() => void) | null>(null);

  propsRef.current = {
    cellSize,
    color,
    radius,
    falloff,
    holdTime,
    fadeDuration,
    lineWidth,
    maxOpacity,
    fillOpacity,
    gridOpacity,
    cellRadius,
    clickPulse,
    pulseSpeed,
  };

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    let columns = 0;
    let rows = 0;
    let offsetX = 0;
    let offsetY = 0;
    let alphas = new Float32Array(0);
    let touchedAt = new Float64Array(0);
    let width = 0;
    let height = 0;
    let animationFrame = 0;
    let running = false;
    let lastFrame = 0;
    const pulses: Pulse[] = [];

    const rebuild = () => {
      const config = propsRef.current;
      width = container.offsetWidth;
      height = container.offsetHeight;
      canvas.width = Math.max(1, Math.round(width * pixelRatio));
      canvas.height = Math.max(1, Math.round(height * pixelRatio));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      columns = Math.ceil(width / config.cellSize) + 1;
      rows = Math.ceil(height / config.cellSize) + 1;
      offsetX = (width - columns * config.cellSize) / 2;
      offsetY = (height - rows * config.cellSize) / 2;
      alphas = new Float32Array(columns * rows);
      touchedAt = new Float64Array(columns * rows);
    };

    const cellCenter = (index: number): [number, number] => {
      const size = propsRef.current.cellSize;
      return [
        offsetX + (index % columns) * size + size / 2,
        offsetY + Math.floor(index / columns) * size + size / 2,
      ];
    };

    const energize = (x: number, y: number, boost = 1) => {
      const config = propsRef.current;
      const effectRadius = Math.max(config.radius, 1);
      const ease = FALLOFF_CURVES[config.falloff];
      const now = performance.now();
      const minColumn = Math.max(
        0,
        Math.floor((x - effectRadius - offsetX) / config.cellSize),
      );
      const maxColumn = Math.min(
        columns - 1,
        Math.floor((x + effectRadius - offsetX) / config.cellSize),
      );
      const minRow = Math.max(0, Math.floor((y - effectRadius - offsetY) / config.cellSize));
      const maxRow = Math.min(
        rows - 1,
        Math.floor((y + effectRadius - offsetY) / config.cellSize),
      );

      for (let row = minRow; row <= maxRow; row += 1) {
        for (let column = minColumn; column <= maxColumn; column += 1) {
          const index = row * columns + column;
          const [centerX, centerY] = cellCenter(index);
          const distance = Math.hypot(centerX - x, centerY - y);
          if (distance > effectRadius) continue;

          const level =
            ease(1 - distance / effectRadius) * config.maxOpacity * Math.max(boost, 0);
          if (level > alphas[index]) alphas[index] = level;
          if (level > 0) touchedAt[index] = now;
        }
      }
    };

    const draw = (now: number) => {
      const config = propsRef.current;
      const delta = Math.min(now - lastFrame, 50);
      lastFrame = now;
      context.clearRect(0, 0, width, height);
      const [red, green, blue] = hexToRgb(config.color);

      if (config.gridOpacity > 0) {
        context.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${config.gridOpacity})`;
        context.lineWidth = 1;
        context.beginPath();
        for (let column = 0; column <= columns; column += 1) {
          const x = Math.round(offsetX + column * config.cellSize) + 0.5;
          context.moveTo(x, 0);
          context.lineTo(x, height);
        }
        for (let row = 0; row <= rows; row += 1) {
          const y = Math.round(offsetY + row * config.cellSize) + 0.5;
          context.moveTo(0, y);
          context.lineTo(width, y);
        }
        context.stroke();
      }

      for (let pulseIndex = pulses.length - 1; pulseIndex >= 0; pulseIndex -= 1) {
        const pulse = pulses[pulseIndex];
        const ringRadius = ((now - pulse.startedAt) / 1000) * config.pulseSpeed;
        if (ringRadius > Math.hypot(width, height)) {
          pulses.splice(pulseIndex, 1);
          continue;
        }

        const band = config.cellSize;
        for (let index = 0; index < alphas.length; index += 1) {
          const [centerX, centerY] = cellCenter(index);
          const distance = Math.hypot(centerX - pulse.x, centerY - pulse.y);
          if (Math.abs(distance - ringRadius) < band / 2) {
            alphas[index] = Math.max(alphas[index], config.maxOpacity);
            touchedAt[index] = now;
          }
        }
      }

      let hasVisibleCells = pulses.length > 0;
      const fadeStep = delta / Math.max(config.fadeDuration, 16);
      const halfCell = config.cellSize / 2;

      for (let index = 0; index < alphas.length; index += 1) {
        let alpha = alphas[index];
        if (alpha <= 0) continue;

        if (now - touchedAt[index] > config.holdTime) {
          alpha = Math.max(0, alpha - fadeStep);
          alphas[index] = alpha;
          if (alpha <= 0) continue;
        }
        hasVisibleCells = true;

        const [centerX, centerY] = cellCenter(index);
        const gradient = context.createRadialGradient(
          centerX,
          centerY,
          halfCell * 0.1,
          centerX,
          centerY,
          config.cellSize,
        );
        gradient.addColorStop(0, `rgba(${red}, ${green}, ${blue}, ${alpha})`);
        gradient.addColorStop(1, `rgba(${red}, ${green}, ${blue}, 0)`);

        context.beginPath();
        const x = centerX - halfCell + 0.5;
        const y = centerY - halfCell + 0.5;
        const size = config.cellSize - 1;
        if (config.cellRadius > 0) {
          context.roundRect(x, y, size, size, config.cellRadius);
        } else {
          context.rect(x, y, size, size);
        }
        if (config.fillOpacity > 0) {
          context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha * config.fillOpacity})`;
          context.fill();
        }
        context.strokeStyle = gradient;
        context.lineWidth = config.lineWidth;
        context.stroke();
      }

      if (hasVisibleCells) {
        animationFrame = requestAnimationFrame(draw);
      } else {
        running = false;
      }
    };

    const wake = () => {
      if (running) return;
      running = true;
      lastFrame = performance.now();
      animationFrame = requestAnimationFrame(draw);
    };
    wakeRef.current = wake;

    const localPoint = (event: PointerEvent): [number, number] | null => {
      const bounds = container.getBoundingClientRect();
      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      ) {
        return null;
      }
      return [event.clientX - bounds.left, event.clientY - bounds.top];
    };

    const onPointerMove = (event: PointerEvent) => {
      if (reducedMotion.matches || !finePointer.matches) return;
      const point = localPoint(event);
      if (!point) return;
      energize(...point);
      wake();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (
        reducedMotion.matches ||
        !finePointer.matches ||
        !propsRef.current.clickPulse
      ) {
        return;
      }
      const point = localPoint(event);
      if (!point) return;
      pulses.push({ x: point[0], y: point[1], startedAt: performance.now() });
      wake();
    };

    const resizeObserver = new ResizeObserver(() => {
      rebuild();
      wake();
    });
    resizeObserver.observe(container);
    rebuild();
    wake();

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      wakeRef.current = null;
    };
  }, [cellSize]);

  useEffect(() => {
    wakeRef.current?.();
  }, [gridOpacity, color, lineWidth, maxOpacity, fillOpacity, cellRadius]);

  return (
    <div
      ref={containerRef}
      className={`cursor-grid ${className}`.trim()}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="cursor-grid__canvas" />
    </div>
  );
}
