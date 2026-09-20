"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CaptureResult = { blob: Blob; dataUrl: string };

interface CameraCaptureProps {
  onCapture: (result: CaptureResult) => void;
  /** Continuous mode auto-captures periodically; photo mode waits for a manual shutter tap. */
  mode?: "photo" | "continuous";
}

/**
 * Live camera preview + still capture, with an upload-image fallback.
 * Mirrors lib/screens/learn_scan_screen.dart's _setUpCamera/_captureImage,
 * translated to navigator.mediaDevices.getUserMedia + <canvas> capture.
 *
 * Handles the exact error classes Phase 15 calls out: NotAllowedError,
 * NotFoundError, NotReadableError, OverconstrainedError, SecurityError.
 */
export function CameraCapture({ onCapture, mode = "photo" }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async (cancelledRef: { current: boolean }) => {
    setStatus("loading");
    setErrorMessage(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("error");
      setErrorMessage(
        "Camera access isn't available in this browser context (it requires HTTPS or localhost). Please upload a photo instead."
      );
      return;
    }
    try {
      // A pending permission prompt that's never answered (e.g. an
      // automated/embedded browser context) would otherwise hang here
      // forever with no fallback — race it against a timeout so the upload
      // option always becomes reachable (Phase 15's "always provide upload
      // as a fallback").
      const stream = await Promise.race([
        navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new DOMException("Timed out waiting for camera permission", "TimeoutError")), 10000)
        ),
      ]);
      // React Strict Mode's dev-only mount→cleanup→remount can unmount us
      // while getUserMedia is still in flight; if that happened, release
      // the just-acquired device immediately instead of leaving it
      // dangling (which would otherwise starve the remount's own attempt
      // with a spurious NotReadableError).
      if (cancelledRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus("ready");
    } catch (error) {
      if (cancelledRef.current) return;
      setStatus("error");
      setErrorMessage(describeCameraError(error));
      console.error("CameraCapture: getUserMedia failed", error);
    }
  }, []);

  useEffect(() => {
    const cancelledRef = { current: false };
    // Deferred to a microtask so the (synchronous) initial setStatus("loading")
    // inside startCamera doesn't run during the effect's commit phase.
    queueMicrotask(() => {
      void startCamera(cancelledRef);
    });
    return () => {
      cancelledRef.current = true;
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const captureFrame = useCallback(async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;
    setCapturing(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
      if (!blob) return;
      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      onCapture({ blob, dataUrl });
    } finally {
      setCapturing(false);
    }
  }, [onCapture]);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        onCapture({ blob: file, dataUrl });
      };
      reader.readAsDataURL(file);
    },
    [onCapture]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%" }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "3 / 4",
          borderRadius: 20,
          overflow: "hidden",
          background: "var(--navy-deep)",
        }}
      >
        {status !== "error" && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: "100%", height: "100%", objectFit: "cover", display: status === "ready" ? "block" : "none" }}
          />
        )}
        {status === "loading" && (
          <Centered>
            <span className="mono-label" style={{ color: "var(--cream)" }}>
              starting camera…
            </span>
          </Centered>
        )}
        {status === "error" && (
          <Centered>
            <div style={{ padding: 24, textAlign: "center", display: "flex", flexDirection: "column", gap: 14 }}>
              <span className="sketch-body" style={{ color: "var(--cream)" }}>
                {errorMessage ?? "Camera unavailable."}
              </span>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: "12px 20px",
                  borderRadius: 20,
                  border: "1.4px solid var(--cream)",
                  background: "transparent",
                  color: "var(--cream)",
                  cursor: "pointer",
                }}
              >
                take a photo instead
              </button>
              <button
                onClick={() => void startCamera({ current: false })}
                style={{
                  padding: "12px 20px",
                  borderRadius: 20,
                  border: "1.4px solid var(--cream)",
                  background: "transparent",
                  color: "var(--cream)",
                  cursor: "pointer",
                }}
              >
                try camera again
              </button>
            </div>
          </Centered>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture={mode === "photo" ? "environment" : undefined}
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />

      {status === "ready" && (
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={captureFrame}
            disabled={capturing}
            style={{
              flex: 1,
              padding: "16px",
              borderRadius: 24,
              border: "none",
              background: "var(--ink)",
              color: "var(--paper-light)",
              fontWeight: 600,
              letterSpacing: 1.1,
              cursor: capturing ? "default" : "pointer",
            }}
          >
            {capturing ? "capturing…" : "capture"}
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: "16px 18px",
              borderRadius: 24,
              border: "1.4px solid rgba(20,22,58,0.3)",
              background: "transparent",
              color: "var(--ink)",
              cursor: "pointer",
            }}
          >
            upload
          </button>
        </div>
      )}
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {children}
    </div>
  );
}

/** Maps browser getUserMedia error names to plain-language copy (Phase 15). */
function describeCameraError(error: unknown): string {
  const name = error instanceof DOMException ? error.name : "";
  switch (name) {
    case "NotAllowedError":
    case "SecurityError":
      return "Camera access was denied. Please allow camera access in your browser settings or upload an image instead.";
    case "NotFoundError":
      return "No camera was found on this device. You can upload an image instead.";
    case "NotReadableError":
      return "The camera is in use by another app or can't be started right now. Close other apps using the camera, or upload an image instead.";
    case "OverconstrainedError":
      return "This device's camera doesn't support the requested settings. Please upload an image instead.";
    case "TimeoutError":
      return "The camera didn't respond in time (a permission prompt may be waiting for a response). Please upload an image instead.";
    default:
      return "Camera unavailable. Please upload an image instead.";
  }
}
