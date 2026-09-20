/** Wordmark glyph: a cloud with a sparkle peeking over the top. */
export function WonderlyLogo({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 84" fill="none">
      <path
        d="M27 78h40a19 19 0 0 0 3-37.7 24 24 0 0 0-45-8A21 21 0 0 0 27 78Z"
        stroke="var(--ink)"
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M50 2 L58 30 L86 34 L58 38 L50 66 L42 38 L14 34 L42 30 Z"
        fill="var(--yellow)"
        stroke="var(--ink)"
        strokeWidth={5}
        strokeLinejoin="round"
      />
    </svg>
  );
}
