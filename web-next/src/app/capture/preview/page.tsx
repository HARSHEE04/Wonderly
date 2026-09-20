"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleIconButton, AtelierButton } from "@/components/AtelierButton";
import { LineIcon } from "@/components/LineIcon";
import { flowState, libraryStore } from "@/lib/appState";
import { completeSession, demoUserId } from "@/lib/apiClient";

/** Ports lib/screens/capture_preview_screen.dart. */
export default function CapturePreviewPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const origin = flowState.origin;
  const challenge = flowState.challenge;
  const imageDataUrl = flowState.capturedImageDataUrl;
  const tint = origin === "Create" ? "var(--marigold-tint)" : "var(--teal-tint)";
  const glyph = origin === "Create" ? "spark" : "symmetry";

  async function save() {
    setSaving(true);
    try {
      libraryStore.add({
        id: `local-${Date.now()}`,
        challengeTitle: challenge?.title ?? "Untitled challenge",
        origin,
        conceptTitle: flowState.conceptTitle,
        photoTint: tint,
        photoGlyph: glyph,
        date: new Date().toISOString(),
        photoDataUrl: imageDataUrl,
      });

      if (flowState.sessionId) {
        await completeSession(flowState.sessionId, demoUserId, challenge?.challengeType, {
          title: challenge?.title,
          origin,
          conceptTitle: flowState.conceptTitle,
        }).catch(() => {
          // offline — the local save above still counts
        });
      }
      router.push("/saved");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <div className="page-content" style={{ paddingTop: 14 }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <CircleIconButton onTap={() => router.back()} filled={false} ariaLabel="close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth={2}>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </CircleIconButton>
          <div style={{ flex: 1, textAlign: "center" }}>
            <span className="mono-label">preview</span>
          </div>
          <div style={{ width: 38 }} />
        </div>
        <div style={{ height: 22 }} />
        <div
          style={{
            flex: 1,
            minHeight: 340,
            borderRadius: 18,
            background: tint,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {imageDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageDataUrl} alt="Captured artwork" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <LineIcon glyph={glyph} size={100} color="rgba(20,22,58,0.7)" />
          )}
        </div>
        <div style={{ height: 24 }} />
        <AtelierButton label={saving ? "saving…" : "save to library"} fill="var(--ink)" disabled={saving} onTap={save} />
      </div>
    </div>
  );
}
