import { useEffect, useState } from 'react';

interface DecryptedTextProps {
  text: string;
  className?: string;
}

const GLYPHS = '01<>/{}[]—+*';

/**
 * Resolves scrambled glyphs into readable copy once on mount. The real text is
 * always exposed to assistive technology and reduced-motion users.
 */
export function DecryptedText({ text, className = '' }: DecryptedTextProps) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    let frame = 0;
    const totalFrames = Math.max(18, text.length * 2);
    const timer = window.setInterval(() => {
      frame += 1;
      const revealed = Math.floor((frame / totalFrames) * text.length);
      setDisplay(
        text
          .split('')
          .map((character, index) => {
            if (character === ' ' || index < revealed) return character;
            return GLYPHS[(frame + index * 7) % GLYPHS.length];
          })
          .join(''),
      );
      if (frame >= totalFrames) {
        setDisplay(text);
        window.clearInterval(timer);
      }
    }, 28);

    return () => window.clearInterval(timer);
  }, [text]);

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{display}</span>
    </span>
  );
}
