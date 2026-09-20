"use client";

import { CSSProperties, ReactNode } from "react";

/**
 * Ports lib/widgets/atelier_button.dart — a lowercase, letter-spaced pill
 * button pinned by a strip of washi tape.
 */
export function AtelierButton({
  label,
  onTap,
  fill = "var(--ink)",
  textColor = "var(--paper-light)",
  outlined = false,
  outlineColor = "var(--ink)",
  tapeColor,
  tapeOnLeft,
  fontSize = 15,
  disabled = false,
}: {
  label: string;
  onTap?: () => void;
  fill?: string;
  textColor?: string;
  outlined?: boolean;
  outlineColor?: string;
  tapeColor?: string;
  tapeOnLeft?: boolean;
  fontSize?: number;
  disabled?: boolean;
}) {
  const onLeft = tapeOnLeft ?? !outlined;
  const resolvedTape = tapeColor ?? (outlined ? "var(--tape-blue)" : "var(--tape-pink)");

  return (
    <div style={{ position: "relative", paddingTop: 11 }}>
      <span
        style={{
          position: "absolute",
          top: 0,
          left: onLeft ? 18 : undefined,
          right: onLeft ? undefined : 18,
          width: 16,
          height: 34,
          background: resolvedTape,
          opacity: 0.85,
          borderRadius: 2,
          transform: `rotate(${onLeft ? -9 : 8}deg)`,
          boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
        }}
      />
      <button
        onClick={onTap}
        disabled={disabled || !onTap}
        style={{
          width: "100%",
          padding: "17px 24px",
          borderRadius: 24,
          border: `1.4px solid ${outlined ? outlineColor + "66" : "var(--ink)"}`,
          background: outlined ? "transparent" : disabled ? fill + "59" : fill,
          color: outlined ? outlineColor : textColor,
          fontSize,
          fontWeight: 600,
          letterSpacing: 1.1,
          textTransform: "lowercase",
          cursor: disabled || !onTap ? "default" : "pointer",
          boxShadow: !outlined && !disabled ? `0 8px 18px ${fill}59` : undefined,
        }}
      >
        {label}
      </button>
    </div>
  );
}

export function CircleIconButton({
  onTap,
  filled = true,
  children,
  ariaLabel,
}: {
  onTap: () => void;
  filled?: boolean;
  children: ReactNode;
  ariaLabel?: string;
}) {
  const style: CSSProperties = {
    width: 38,
    height: 38,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: filled ? "var(--paper-tile)" : "transparent",
    border: filled ? "none" : "1.4px solid rgba(20,22,58,0.25)",
    cursor: "pointer",
  };
  return (
    <button onClick={onTap} style={style} aria-label={ariaLabel}>
      {children}
    </button>
  );
}

export function BackButton({ onTap }: { onTap: () => void }) {
  return (
    <CircleIconButton onTap={onTap} filled={false} ariaLabel="back">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 5l-7 7 7 7" />
      </svg>
    </CircleIconButton>
  );
}
