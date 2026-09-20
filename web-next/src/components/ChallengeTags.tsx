import type { CreativeChallenge } from "@/lib/types";

/** Ports lib/widgets/challenge_tags.dart. */
export function ChallengeTags({ challenge }: { challenge: CreativeChallenge }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Tag label={`difficulty ${challenge.difficulty}/5`} />
      <Tag label={`type · ${challenge.challengeType}`} />
    </div>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <span
      className="mono-label"
      style={{ padding: "7px 12px", border: "1px solid rgba(20,22,58,0.16)", borderRadius: 20, fontSize: 12 }}
    >
      {label}
    </span>
  );
}
