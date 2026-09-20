"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BackButton, AtelierButton } from "@/components/AtelierButton";
import { ChallengeTags } from "@/components/ChallengeTags";
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

  return (
    <div className="page">
      <div className="page-content" style={{ paddingTop: 4 }}>
        <BackButton onTap={() => router.back()} />
        <div style={{ height: 22 }} />
        <span className="mono-label" style={{ color: "var(--violet)" }}>
          based on {element?.name.toLowerCase() ?? "this concept"}
        </span>
        <div style={{ height: 10 }} />
        {loading && <p className="sketch-body">loading…</p>}
        {!loading && error && <p className="sketch-body" style={{ fontSize: 16.5 }}>{error}</p>}
        {!loading && !error && challenge && (
          <>
            <h1 className="editorial-display" style={{ fontSize: 30 }}>
              {challenge.title}
            </h1>
            <div style={{ height: 14 }} />
            <p className="sketch-body" style={{ fontSize: 16.5 }}>
              {challenge.instructions}
            </p>
            <div style={{ height: 16 }} />
            <ChallengeTags challenge={challenge} />
          </>
        )}
        <div style={{ height: 40 }} />
        {error ? (
          <AtelierButton label="retry" fill="var(--ink)" onTap={load} />
        ) : (
          !loading && challenge && <AtelierButton label="start challenge" fill="var(--ink)" onTap={start} />
        )}
      </div>
    </div>
  );
}

