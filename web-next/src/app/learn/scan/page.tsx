"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { BackButton } from "@/components/AtelierButton";
import { CameraCapture, type CaptureResult } from "@/components/CameraCapture";
import { flowState } from "@/lib/appState";

/** Ports lib/screens/learn_scan_screen.dart. */
export default function LearnScanPage() {
  const router = useRouter();

  const handleCapture = useCallback(
    (result: CaptureResult) => {
      flowState.origin = "Learn";
      flowState.capturedImageDataUrl = result.dataUrl;
      flowState.pendingBlob = result.blob;
      router.push("/learn/analyzing");
    },
    [router]
  );

  return (
    <div className="page">
      <div className="page-content" style={{ paddingTop: 4 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <BackButton onTap={() => router.back()} />
          <span className="mono-label">take a photo</span>
          <div style={{ width: 38 }} />
        </div>
        <div style={{ height: 16 }} />
        <CameraCapture onCapture={handleCapture} />
      </div>
    </div>
  );
}
