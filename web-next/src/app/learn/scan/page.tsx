"use client";

import { Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BackButton } from "@/components/AtelierButton";
import { CameraCapture, type CaptureResult } from "@/components/CameraCapture";
import { flowState } from "@/lib/appState";

/** Ports lib/screens/learn_scan_screen.dart. */
export default function LearnScanPage() {
  return (
    <Suspense fallback={null}>
      <LearnScanPageInner />
    </Suspense>
  );
}

function LearnScanPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const mode = params.get("mode") === "continuous" ? "continuous" : "photo";
  const origin = params.get("origin") === "Create" ? "Create" : "Learn";

  const handleCapture = useCallback(
    (result: CaptureResult) => {
      flowState.origin = origin;
      flowState.capturedImageDataUrl = result.dataUrl;
      flowState.pendingBlob = result.blob;
      router.push(`/learn/analyzing?origin=${origin}`);
    },
    [origin, router]
  );

  return (
    <div className="page">
      <div className="page-content" style={{ paddingTop: 4 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <BackButton onTap={() => router.back()} />
          <span className="mono-label">{mode === "continuous" ? "continuous scan" : "take a photo"}</span>
          <div style={{ width: 38 }} />
        </div>
        <div style={{ height: 16 }} />
        <CameraCapture mode={mode} onCapture={handleCapture} />
      </div>
    </div>
  );
}
