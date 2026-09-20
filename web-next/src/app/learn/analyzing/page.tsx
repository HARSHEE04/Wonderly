"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSession, generateLearningContent, demoUserId, ApiException } from "@/lib/apiClient";
import { analyzeImage } from "@/lib/visionClient";
import { flowState } from "@/lib/appState";
import { AtelierButton } from "@/components/AtelierButton";

const STEPS = ["reading colors", "tracing shapes", "noticing patterns", "finding concepts"];

/** Ports lib/screens/learn_analyzing_screen.dart. Same pipeline for camera-captured and uploaded images. */
export default function LearnAnalyzingPage() {
  return (
    <Suspense fallback={null}>
      <LearnAnalyzingPageInner />
    </Suspense>
  );
}

function LearnAnalyzingPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const origin = params.get("origin") === "Create" ? "Create" : "Learn";
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 500);
    return () => clearInterval(interval);
  }, []);

  async function startFlow() {
    try {
      const blob = flowState.pendingBlob;
      if (!blob) throw new ApiException("No image was captured. Please try again.");

      const minimumDisplay = new Promise((resolve) => setTimeout(resolve, 1200));
      const sessionId = await createSession(demoUserId, origin === "Create" ? "creative" : "learning");
      const vision = await analyzeImage(blob, sessionId);
      const learningContent = await generateLearningContent(sessionId);

      flowState.sessionId = sessionId;
      flowState.learnSessionResult = {
        sessionId,
        decision: vision.decision,
        learningContent,
      };
      flowState.currentSceneAnalysis = null;

      await minimumDisplay;

      if (origin === "Create") {
        router.replace("/create/challenge");
      } else {
        router.replace("/learn/found");
      }
    } catch (err) {
      console.error("LearnAnalyzingPage: analyze flow failed", err);
      setError(err instanceof ApiException && err.message ? err.message : "We couldn't analyze this image. Please try again.");
    }
  }

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void startFlow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <div className="page">
      <div className="page-content" style={{ justifyContent: "center", alignItems: "center", textAlign: "center", gap: 20 }}>
        {error ? (
          <>
            <p className="sketch-body" style={{ fontSize: 16.5 }}>
              {error}
            </p>
            <AtelierButton label="try again" fill="var(--ink)" onTap={() => router.back()} />
          </>
        ) : (
          <>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                border: "4px solid var(--paper-tile)",
                borderTopColor: "var(--pink-deep)",
                animation: "spin 1s linear infinite",
              }}
            />
            <span className="mono-label">{STEPS[step]}</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </>
        )}
      </div>
    </div>
  );
}
