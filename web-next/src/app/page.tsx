"use client";

import { useRouter } from "next/navigation";
import { CircleIconButton, AtelierButton } from "@/components/AtelierButton";

/** Ports lib/screens/home_screen.dart. */
export default function HomePage() {
  const router = useRouter();

  return (
    <div className="page">
      <div className="page-content" style={{ paddingTop: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ width: 38 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--ink)", display: "inline-block" }} />
            <span className="mono-label" style={{ fontSize: 13, letterSpacing: 3 }}>
              wonderly
            </span>
          </div>
          <CircleIconButton onTap={() => router.push("/library")} filled={false} ariaLabel="library">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth={1.8}>
              <rect x="3" y="3" width="8" height="8" rx="1.5" />
              <rect x="13" y="3" width="8" height="8" rx="1.5" />
              <rect x="3" y="13" width="8" height="8" rx="1.5" />
              <rect x="13" y="13" width="8" height="8" rx="1.5" />
            </svg>
          </CircleIconButton>
        </div>

        <div style={{ height: 90 }} />

        <h1 className="sketch-display" style={{ fontSize: 36, textAlign: "center" }}>
          Start with wonder.
        </h1>

        <div style={{ height: 20 }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
          <ChecklistItem label="Explore the world around you" rotate={-1.4} />
          <ChecklistItem label="Discover something new" rotate={1.6} />
          <ChecklistItem label="Create" rotate={-0.7} />
        </div>

        <div style={{ height: 90 }} />

        <AtelierButton
          label="create"
          fill="var(--yellow)"
          textColor="var(--ink)"
          tapeColor="var(--tape-pink)"
          tapeOnLeft
          fontSize={17}
          onTap={() => router.push("/learn/scan?mode=continuous&origin=Create")}
        />
        <div style={{ height: 12 }} />
        <AtelierButton
          label="learn"
          fill="var(--yellow)"
          textColor="var(--ink)"
          tapeColor="var(--tape-blue)"
          tapeOnLeft={false}
          fontSize={17}
          onTap={() => router.push("/learn")}
        />
      </div>
    </div>
  );
}

function ChecklistItem({ label, rotate }: { label: string; rotate: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 14px",
        background: "var(--paper-light)",
        borderRadius: 16,
        border: "1px solid rgba(20,22,58,0.1)",
        boxShadow: "0 3px 7px rgba(20,22,58,0.1)",
        transform: `rotate(${rotate}deg)`,
      }}
    >
      <span
        style={{
          width: 24,
          height: 24,
          borderRadius: 6,
          border: "1.4px solid var(--ink)",
          background: "var(--paper)",
        }}
      />
      <span className="sketch-body" style={{ fontSize: 15 }}>
        {label}
      </span>
    </div>
  );
}
