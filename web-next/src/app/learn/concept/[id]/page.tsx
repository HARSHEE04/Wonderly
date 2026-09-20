"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { BackButton, AtelierButton } from "@/components/AtelierButton";
import { LineIcon } from "@/components/LineIcon";
import { flowState } from "@/lib/appState";

const GLYPH_FOR: Record<string, "palette" | "lines" | "wave" | "stripes" | "circle"> = {
  color: "palette",
  line: "lines",
  texture: "wave",
  pattern: "stripes",
};
const ACCENT_FOR: Record<string, string> = {
  color: "var(--coral)",
  line: "var(--sky)",
  texture: "var(--forest-green)",
  pattern: "var(--pink-deep)",
};

/** Ports lib/screens/learn_concept_screen.dart. */
export default function LearnConceptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const index = Number(id);
  const element = flowState.learnSessionResult?.learningContent.elements[index];

  if (!element) {
    return (
      <div className="page">
        <div className="page-content" style={{ paddingTop: 4 }}>
          <BackButton onTap={() => router.back()} />
          <p className="sketch-body" style={{ marginTop: 20 }}>
            This concept is no longer available. Go back and scan again.
          </p>
        </div>
      </div>
    );
  }

  const accent = ACCENT_FOR[element.category] ?? "var(--violet)";
  const glyph = GLYPH_FOR[element.category] ?? "circle";

  return (
    <div className="page">
      <div className="page-content" style={{ paddingTop: 4 }}>
        <BackButton onTap={() => router.back()} />
        <div style={{ height: 20 }} />
        <span className="mono-label" style={{ color: accent }}>
          we found
        </span>
        <div style={{ height: 6 }} />
        <h1 className="editorial-display" style={{ fontSize: 32 }}>
          {element.name}
        </h1>
        <div style={{ height: 18 }} />
        <div
          style={{
            width: 160,
            height: 160,
            margin: "0 auto",
            background: "var(--paper-light)",
            borderRadius: 20,
            boxShadow: "0 10px 20px rgba(20,22,58,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LineIcon glyph={glyph} size={76} color={accent} />
        </div>
        <div style={{ height: 20 }} />
        <p className="sketch-body" style={{ fontSize: 16.5 }}>
          {element.description}
        </p>
        <div style={{ height: 20 }} />
        <span className="mono-label">how artists use it</span>
        <div style={{ height: 16 }} />
        <div style={{ padding: 16, background: "var(--paper-tile)", borderRadius: 16, position: "relative" }}>
          <span
            style={{
              position: "absolute",
              top: -14,
              right: 24,
              width: 16,
              height: 34,
              background: "var(--tape-purple)",
              opacity: 0.85,
              transform: "rotate(9deg)",
              borderRadius: 2,
            }}
          />
          <span
            className="mono-label"
            style={{
              display: "inline-block",
              padding: "3px 8px",
              border: "1px solid rgba(20,22,58,0.16)",
              borderRadius: 10,
              fontSize: 11,
            }}
          >
            {element.category}
          </span>
          <div style={{ height: 10 }} />
          <div className="sketch-body" style={{ fontSize: 16.5, fontWeight: 700, color: "var(--ink)" }}>
            {element.artisticUse}
          </div>
          <div style={{ height: 6 }} />
          <div className="sketch-body" style={{ fontSize: 14.5 }}>
            {element.effect}
          </div>
          <div style={{ height: 10 }} />
          <span className="mono-label" style={{ fontSize: 12 }}>
            {element.howToUse}
          </span>
        </div>
        <div style={{ height: 32 }} />
        <AtelierButton label="try it" fill="var(--ink)" onTap={() => router.push(`/learn/challenge/${id}`)} />
        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}
