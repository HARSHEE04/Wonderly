"use client";

import { useRouter } from "next/navigation";
import { BackButton } from "@/components/AtelierButton";
import { LineIcon } from "@/components/LineIcon";

/** Ports lib/screens/learn_mode_screen.dart. */
export default function LearnModePage() {
  const router = useRouter();

  return (
    <div className="page">
      <div className="page-content" style={{ paddingTop: 4 }}>
        <BackButton onTap={() => router.back()} />
        <div style={{ height: 22 }} />
        <span className="mono-label">learn · discover</span>
        <div style={{ height: 8 }} />
        <h1 className="editorial-display" style={{ fontSize: 28 }}>
          See what&apos;s around you.
        </h1>
        <div style={{ height: 6 }} />
        <p className="sketch-body" style={{ fontSize: 16 }}>
          Take a photo to begin.
        </p>
        <div style={{ height: 28 }} />

        <ModeRow
          glyph="camera"
          title="take a photo"
          subtitle="one still frame, analyzed once"
          onTap={() => router.push("/learn/scan")}
        />
      </div>
    </div>
  );
}

function ModeRow({
  glyph,
  title,
  subtitle,
  onTap,
}: {
  glyph: "camera";
  title: string;
  subtitle: string;
  onTap: () => void;
}) {
  return (
    <button
      onClick={onTap}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        width: "100%",
        padding: 16,
        background: "var(--paper-tile)",
        borderRadius: 16,
        border: "none",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <LineIcon glyph={glyph} size={28} />
      <div style={{ flex: 1 }}>
        <div className="sketch-body" style={{ fontSize: 16.5, fontWeight: 700, color: "var(--ink)" }}>
          {title}
        </div>
        <div className="sketch-body" style={{ fontSize: 13.5 }}>
          {subtitle}
        </div>
      </div>
      <span style={{ opacity: 0.4 }}>→</span>
    </button>
  );
}
