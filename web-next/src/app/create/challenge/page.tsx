"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BackButton, AtelierButton } from "@/components/AtelierButton";
import { ChallengeTags } from "@/components/ChallengeTags";
import { LineIcon } from "@/components/LineIcon";
import { createSession, generateCreativeChallenge, demoUserId } from "@/lib/apiClient";
import { flowState } from "@/lib/appState";
import type { CreativeChallenge } from "@/lib/types";

/** Ports lib/screens/create_challenge_screen.dart. */
export default function CreateChallengePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [challenge, setChallenge] = useState<CreativeChallenge | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      let sessionId = flowState.sessionId;
      if (!sessionId) {
        sessionId = await createSession(demoUserId, "creative");
        flowState.sessionId = sessionId;
      }
      const saved = await generateCreativeChallenge(sessionId);
      setChallenge(saved);
    } catch {
      setError("Could not load your challenge. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function start() {
    if (!challenge) return;
    flowState.challenge = challenge;
    flowState.origin = "Create";
    router.push("/create/reminder");
  }

  return (
    <div className="page">
      <div className="page-content" style={{ paddingTop: 4 }}>
        <BackButton onTap={() => router.back()} />
        <div style={{ height: 26 }} />
        {loading && <p className="sketch-body">loading…</p>}
        {!loading && error && <p className="sketch-body" style={{ fontSize: 16.5 }}>{error}</p>}
        {!loading && !error && challenge && (
          <div
            style={{
              background: "var(--sticky-note)",
              borderRadius: 4,
              padding: 20,
              boxShadow: "0 8px 20px rgba(20,22,58,0.12)",
              transform: "rotate(-1deg)",
            }}
          >
            <span className="mono-label">create · daily challenge</span>
            <div style={{ height: 12 }} />
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <LineIcon glyph="compass" size={30} />
              <h1 className="editorial-display" style={{ fontSize: 30, background: "#FFCB3D33" }}>
                {challenge.title}
              </h1>
            </div>
            <div style={{ height: 14 }} />
            <p className="sketch-body" style={{ fontSize: 16.5 }}>
              {challenge.instructions}
            </p>
            <div style={{ height: 16 }} />
            <ChallengeTags challenge={challenge} />
          </div>
        )}
        <div style={{ height: 40 }} />
        <p className="sketch-display" style={{ fontSize: 20, color: "var(--pink-deep)" }}>
          there are no wrong answers here
        </p>
        <div style={{ height: 16 }} />
        {error ? (
          <AtelierButton label="retry" fill="var(--ink)" onTap={load} />
        ) : (
          !loading && challenge && <AtelierButton label="start challenge" fill="var(--ink)" onTap={start} />
        )}
      </div>
    </div>
  );
}
