"use client";

import { useRouter } from "next/navigation";
import { BackButton } from "@/components/AtelierButton";
import { LineIcon } from "@/components/LineIcon";
import { ReadAloudButton } from "@/components/ReadAloudButton";
import { flowState } from "@/lib/appState";
import type { LearningElement } from "@/lib/types";

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

/** Ports lib/screens/learn_found_screen.dart (reverted flat-list version). */
export default function LearnFoundPage() {
  const router = useRouter();
  const learningContent = flowState.learnSessionResult?.learningContent;
  const spokenText = learningContent
    ? [
        learningContent.summary,
        learningContent.elements.length
          ? `We found ${learningContent.elements.length} concepts to explore: ${learningContent.elements
              .map((e) => e.name)
              .join(", ")}.`
          : "",
      ]
        .filter(Boolean)
        .join(" ")
    : "";

  return (
    <div className="page">
      <div className="page-content" style={{ paddingTop: 8 }}>
        <BackButton onTap={() => router.back()} />
        <div style={{ height: 8 }} />
        <h1 className="sketch-display" style={{ fontSize: 36 }}>
          what <span style={{ background: "#FFCB3D66" }}>found</span>
        </h1>
        <div style={{ height: 6 }} />
        <p className="sketch-body" style={{ fontSize: 15 }}>
          {learningContent?.summary ?? "Learning content is unavailable. Go back and scan again."}
        </p>
        {spokenText && (
          <>
            <div style={{ height: 14 }} />
            <ReadAloudButton text={spokenText} />
          </>
        )}
        <div style={{ height: 22 }} />
        <span className="mono-label">concepts to explore</span>
        <div style={{ height: 12 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {(learningContent?.elements ?? []).map((element, i) => (
            <ConceptRow key={i} element={element} onTap={() => router.push(`/learn/concept/${i}`)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ConceptRow({ element, onTap }: { element: LearningElement; onTap: () => void }) {
  const glyph = GLYPH_FOR[element.category] ?? "circle";
  const accent = ACCENT_FOR[element.category] ?? "var(--violet)";
  return (
    <button
      onClick={onTap}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: 14,
        background: "var(--paper-tile)",
        borderRadius: 16,
        border: "none",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <LineIcon glyph={glyph} size={28} color={accent} />
      <div style={{ flex: 1 }}>
        <div className="sketch-body" style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>
          {element.name}
        </div>
        <div className="sketch-body" style={{ fontSize: 13.5 }}>
          {element.description}
        </div>
      </div>
      <span style={{ opacity: 0.4 }}>→</span>
    </button>
  );
}
