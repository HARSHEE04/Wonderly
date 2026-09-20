"use client";

type Glyph =
  | "circle"
  | "plant"
  | "lines"
  | "wave"
  | "stripes"
  | "spark"
  | "symmetry"
  | "palette"
  | "camera"
  | "perspective"
  | "compass"
  | "cloud";

/**
 * Simplified hand-drawn line icon set — a web-friendly stand-in for
 * lib/widgets/line_icon.dart's CustomPainter glyphs. Same glyph names/usage
 * sites, drawn as simple stroke-only SVGs instead of pixel-identical paths.
 */
export function LineIcon({
  glyph,
  size = 28,
  color = "var(--ink)",
}: {
  glyph: Glyph;
  size?: number;
  color?: string;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (glyph) {
    case "plant":
      return (
        <svg {...common}>
          <path d="M12 21V10" />
          <path d="M12 10c0-4 3-6 6-6-1 4-3 6-6 6Z" />
          <path d="M12 14c0-3-2.5-5-5.5-5C7 12.5 9 14 12 14Z" />
        </svg>
      );
    case "lines":
      return (
        <svg {...common}>
          <path d="M4 6h16" />
          <path d="M4 12h10" />
          <path d="M4 18h14" />
        </svg>
      );
    case "wave":
      return (
        <svg {...common}>
          <path d="M3 8c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />
          <path d="M3 16c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />
        </svg>
      );
    case "stripes":
      return (
        <svg {...common}>
          <path d="M4 5l4 14" />
          <path d="M10 5l4 14" />
          <path d="M16 5l4 14" />
        </svg>
      );
    case "spark":
      return (
        <svg {...common}>
          <path d="M12 3v6" />
          <path d="M12 15v6" />
          <path d="M3 12h6" />
          <path d="M15 12h6" />
          <path d="M6 6l4 4" />
          <path d="M14 14l4 4" />
          <path d="M18 6l-4 4" />
          <path d="M10 14l-4 4" />
        </svg>
      );
    case "symmetry":
      return (
        <svg {...common}>
          <path d="M12 3v18" />
          <path d="M5 7c3 1 3 9 0 10" />
          <path d="M19 7c-3 1-3 9 0 10" />
        </svg>
      );
    case "palette":
      return (
        <svg {...common}>
          <path d="M12 3a9 8 0 1 0 0 16c1.5 0 2-1 2-2s-.5-1.5-1-2 0-2 1.5-2H16a5 5 0 0 0 5-5c0-2.8-4-5-9-5Z" />
          <circle cx="8" cy="10" r="0.8" fill={color} />
          <circle cx="12" cy="8" r="0.8" fill={color} />
          <circle cx="16" cy="10" r="0.8" fill={color} />
        </svg>
      );
    case "camera":
      return (
        <svg {...common}>
          <path d="M4 8h3l1.5-2h7L17 8h3v10H4z" />
          <circle cx="12" cy="13" r="3" />
        </svg>
      );
    case "perspective":
      return (
        <svg {...common}>
          <path d="M3 20h18" />
          <path d="M6 20l3-9h6l3 9" />
          <path d="M12 3l-1 8h2z" />
        </svg>
      );
    case "compass":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M14.5 9.5L10 14l1-4.5 4.5-1z" />
        </svg>
      );
    case "cloud":
      return (
        <svg {...common}>
          <path d="M7 17a4 4 0 1 1 1.2-7.8A5 5 0 0 1 18 11a3.5 3.5 0 0 1-1 6.9H7Z" />
        </svg>
      );
    case "circle":
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}
