"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BackButton, AtelierButton } from "@/components/AtelierButton";
import { ChallengeTags } from "@/components/ChallengeTags";
import { LineIcon } from "@/components/LineIcon";
import { ReadAloudButton } from "@/components/ReadAloudButton";
import { generateCreativeChallenge } from "@/lib/apiClient";
import { flowState } from "@/lib/appState";
import type { CreativeChallenge } from "@/lib/types";

/** Ports lib/screens/learn_challenge_screen.dart. */
export default function LearnChallengePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [challenge, setChallenge] = useState<CreativeChallenge | null>(null);
  const [error, setError] = useState<string | null>(null);

  const result = flowState.learnSessionResult;
  const element = result?.learningContent.elements[Number(id)];

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    if (!result || !element) {
      setError("Could not load this practice challenge. Scan again to retry.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const saved = await generateCreativeChallenge(result.sessionId, {
        focusConcept: element.name,
        learningInsight: `${element.description} ${element.artisticUse} ${element.effect}`,
        learningEvidence: [element.howToUse, element.activity, result.learningContent.summary],
      });
      setChallenge(saved);
    } catch {
      setError("Could not load this practice challenge. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function start() {
    if (!challenge || !element) return;
    flowState.challenge = challenge;
    flowState.origin = "Learn";
    flowState.conceptTitle = element.name;
    router.push("/create/reminder");
  }

  const instructionBullets = challenge ? splitInstructions(challenge.instructions) : [];

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
            <span className="mono-label">based on {element?.name.toLowerCase() ?? "this concept"}</span>
            <div style={{ height: 12 }} />
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <LineIcon glyph="compass" size={30} />
              <h1 className="editorial-display" style={{ fontSize: 30, background: "#FFCB3D33" }}>
                {challenge.title}
              </h1>
            </div>
            <div style={{ height: 14 }} />
            <ul
              aria-label="practice steps"
              style={{ display: "grid", gap: 12, listStyle: "none", padding: 0 }}
            >
              {instructionBullets.map((instruction, index) => (
                <li key={`${instruction}-${index}`} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ flex: "0 0 auto", marginTop: 2, display: "grid", placeItems: "center", width: 24, height: 24, borderRadius: "50%", background: "#fbe87d88" }}>
                    <LineIcon glyph="spark" size={17} color="var(--pink-deep)" />
                  </span>
                  <span className="sketch-body" style={{ fontSize: 16.5 }}>{instruction}</span>
                </li>
              ))}
            </ul>
            <div style={{ height: 16 }} />
            <ChallengeTags challenge={challenge} />
            <div style={{ height: 16 }} />
            <ReadAloudButton
              text={`Your creative challenge is ${challenge.title}. ${challenge.instructions} This is a difficulty ${challenge.difficulty} out of 5, ${challenge.challengeType} challenge.`}
            />
          </div>
        )}
        <div style={{ height: 40 }} />
        <p className="sketch-display" style={{ width: "100%", textAlign: "center", fontSize: 20, color: "var(--pink-deep)" }}>
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

function splitInstructions(instructions: string): string[] {
  const sentences = instructions
    .match(/[^.!?]+[.!?]+|[^.!?]+$/g)
    ?.map((sentence) => sentence.trim())
    .filter(Boolean) ?? [];
  return sentences.length ? sentences : [instructions];
}
