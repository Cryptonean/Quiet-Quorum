import { useCallback, type CSSProperties, type PointerEvent, type PropsWithChildren } from 'react';

interface SpotlightCardProps extends PropsWithChildren {
  className?: string;
}

/**
 * Pointer-tracked monochrome spotlight inspired by React Bits' Spotlight Card.
 * The surface remains fully usable without pointer input or animation.
 */
export function SpotlightCard({ children, className = '' }: SpotlightCardProps) {
  const moveSpotlight = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--spot-x', `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty('--spot-y', `${event.clientY - bounds.top}px`);
  }, []);

  return (
    <div
      className={`spotlight-card ${className}`}
      onPointerMove={moveSpotlight}
      style={{ '--spot-x': '50%', '--spot-y': '50%' } as CSSProperties}
    >
      {children}
    </div>
  );
}
