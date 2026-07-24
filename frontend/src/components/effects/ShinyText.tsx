import type { CSSProperties } from 'react';

interface ShinyTextProps {
  children: string;
  className?: string;
  speed?: number;
}

/**
 * A lightweight, reduced-motion-safe metallic text treatment inspired by
 * React Bits' Shiny Text component.
 */
export function ShinyText({ children, className = '', speed = 5 }: ShinyTextProps) {
  return (
    <span
      className={`shiny-text ${className}`}
      style={{ '--shine-speed': `${speed}s` } as CSSProperties}
    >
      {children}
    </span>
  );
}
