"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleIconButton, AtelierButton } from "@/components/AtelierButton";
import { LineIcon } from "@/components/LineIcon";
import { flowState } from "@/lib/appState";

/** Ports lib/screens/capture_screen.dart — upload a real photo of the finished artwork. */
export default function CapturePage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [picking, setPicking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPicking(true);
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      flowState.capturedImageDataUrl = reader.result as string;
      setPicking(false);
      router.push("/capture/preview");
    };
    reader.onerror = () => {
      setPicking(false);
      setError("Could not upload photo. Please try again.");
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="page">
      <div className="page-content" style={{ paddingTop: 12 }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <CircleIconButton onTap={() => router.back()} filled={false} ariaLabel="close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth={2}>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </CircleIconButton>
          <div style={{ flex: 1, textAlign: "center" }}>
            <span className="mono-label">upload your artwork</span>
          </div>
          <div style={{ width: 38 }} />
        </div>
        <div style={{ height: 14 }} />
        <div
          style={{
            flex: 1,
            borderRadius: 20,
            border: "2px dashed rgba(20,22,58,0.25)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 18,
            minHeight: 320,
          }}
        >
          <LineIcon glyph="camera" size={56} color="var(--ink-soft)" />
          {error && (
            <span className="sketch-body" style={{ color: "var(--pink-deep)" }}>
              {error}
            </span>
          )}
        </div>
        <div style={{ height: 20 }} />
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
        <AtelierButton
          label={picking ? "uploading…" : "upload a photo"}
          fill="var(--ink)"
          disabled={picking}
          onTap={() => inputRef.current?.click()}
        />
      </div>
    </div>
  );
}
