"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AtelierButton, BackButton } from "@/components/AtelierButton";
import { CommunityAvatar } from "@/components/CommunityAvatar";
import { LineIcon } from "@/components/LineIcon";
import {
  demoLearner,
  getPeerMatch,
  peerProfiles,
  type PeerMatch,
  type PeerProfile,
} from "@/lib/peerLearning";
import styles from "./page.module.css";

type SwipeChoice = "pass" | "connect";
type DragState = { x: number; y: number };
type PointerStart = { pointerId: number; x: number; y: number };

const SWIPE_THRESHOLD = 96;

export default function PeerLearningPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState<DragState>({ x: 0, y: 0 });
  const [pointerStart, setPointerStart] = useState<PointerStart | null>(null);
  const [choiceInProgress, setChoiceInProgress] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [matchProfile, setMatchProfile] = useState<PeerProfile | null>(null);

  const profile = peerProfiles[index] ?? null;
  const match = useMemo(
    () => (profile ? getPeerMatch(demoLearner, profile) : null),
    [profile],
  );
  const dragProgress = Math.max(-1, Math.min(1, drag.x / SWIPE_THRESHOLD));

  function resetDeck() {
    setIndex(0);
    setDrag({ x: 0, y: 0 });
    setPointerStart(null);
    setChoiceInProgress(false);
    setStatus("Back to the first artist card.");
  }

  function choose(choice: SwipeChoice) {
    if (!profile || choiceInProgress) return;

    const chosenProfile = profile;
    const chosenMatch = getPeerMatch(demoLearner, chosenProfile);
    const width = typeof window === "undefined" ? 480 : window.innerWidth;
    const direction = choice === "connect" ? 1 : -1;

    setChoiceInProgress(true);
    setPointerStart(null);
    setDrag({ x: direction * (width + 160), y: drag.y });

    window.setTimeout(() => {
      setIndex((current) => current + 1);
      setDrag({ x: 0, y: 0 });
      setChoiceInProgress(false);
      setStatus(
        choice === "pass"
          ? `Passed on ${chosenProfile.name}.`
          : chosenMatch.isMutual
            ? `Saved a mutual match with ${chosenProfile.name}.`
            : `Saved ${chosenProfile.name} for later.`,
      );

      if (choice === "connect" && chosenMatch.isMutual) {
        setMatchProfile(chosenProfile);
      }
    }, 230);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!profile || choiceInProgress) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setPointerStart({
      pointerId: event.pointerId,
      x: event.clientX - drag.x,
      y: event.clientY - drag.y,
    });
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!pointerStart || pointerStart.pointerId !== event.pointerId) return;
    setDrag({
      x: event.clientX - pointerStart.x,
      y: (event.clientY - pointerStart.y) * 0.2,
    });
  }

  function handlePointerEnd(event: React.PointerEvent<HTMLDivElement>) {
    if (!pointerStart || pointerStart.pointerId !== event.pointerId) return;
    setPointerStart(null);

    if (drag.x > SWIPE_THRESHOLD) {
      choose("connect");
    } else if (drag.x < -SWIPE_THRESHOLD) {
      choose("pass");
    } else {
      setDrag({ x: 0, y: 0 });
    }
  }

  return (
    <div className={`page ${styles.shell}`}>
      <div className="page-content">
        <header className={styles.header}>
          <BackButton onTap={() => router.back()} />
          <div className={styles.titleGroup}>
            <h1 className={`sketch-display ${styles.pageTitle}`}>
              peer sketchbook
            </h1>
            <span className={`mono-label ${styles.subtitle}`}>
              swipe through learning trades
            </span>
          </div>
        </header>

        <LearnerSummary />

        <main className={styles.deckArea}>
          {profile && match ? (
            <section className={styles.deck} aria-label="Peer learning cards">
              <div className={styles.backCard} aria-hidden="true" />
              <div
                className={styles.swipeLayer}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerEnd}
                onPointerCancel={handlePointerEnd}
                style={{
                  transform: `translate(${drag.x}px, ${drag.y}px) rotate(${Math.max(-10, Math.min(10, drag.x / 28))}deg)`,
                  transition: pointerStart
                    ? "none"
                    : "transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1)",
                }}
              >
                <PeerCard
                  profile={profile}
                  match={match}
                  connectOpacity={Math.max(0, dragProgress)}
                  passOpacity={Math.max(0, -dragProgress)}
                />
              </div>
            </section>
          ) : (
            <EmptyDeck onReset={resetDeck} />
          )}
        </main>

        <footer className={styles.footer}>
          <p
            className={`sketch-body ${styles.hint} ${
              status ? styles.status : ""
            }`}
            aria-live="polite"
          >
            {status ?? "Swipe left to pass. Swipe right to connect."}
          </p>
          <div className={styles.actions}>
            <AtelierButton
              label="pass"
              outlined
              outlineColor="#14163A"
              tapeColor="var(--tape-blue)"
              tapeOnLeft
              fontSize={14}
              disabled={!profile || choiceInProgress}
              onTap={() => choose("pass")}
            />
            <AtelierButton
              label="connect"
              fill="#FBE87D"
              textColor="#14163A"
              tapeColor="var(--tape-pink)"
              tapeOnLeft={false}
              fontSize={14}
              disabled={!profile || choiceInProgress}
              onTap={() => choose("connect")}
            />
          </div>
        </footer>
      </div>

      {matchProfile && (
        <LearningMatchModal
          profile={matchProfile}
          onClose={() => setMatchProfile(null)}
        />
      )}
    </div>
  );
}

function LearnerSummary() {
  return (
    <section className={styles.summary} aria-label="Your peer learning goals">
      <SummaryColumn
        title="You teach"
        skills={demoLearner.canTeach}
        color="var(--yellow)"
      />
      <span className={styles.divider} aria-hidden="true" />
      <SummaryColumn
        title="You want"
        skills={demoLearner.wantsToLearn}
        color="var(--sky)"
      />
    </section>
  );
}

function SummaryColumn({
  title,
  skills,
  color,
}: {
  title: string;
  skills: string[];
  color: string;
}) {
  return (
    <div>
      <span className={`mono-label ${styles.summaryTitle}`}>{title}</span>
      <div className={styles.chipRow}>
        {skills.map((skill) => (
          <span
            key={skill}
            className={`sketch-body ${styles.chip}`}
            style={{ "--chip-color": color } as React.CSSProperties}
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}

function PeerCard({
  profile,
  match,
  connectOpacity,
  passOpacity,
}: {
  profile: PeerProfile;
  match: PeerMatch;
  connectOpacity: number;
  passOpacity: number;
}) {
  return (
    <article
      className={styles.card}
      style={
        {
          "--accent-color": profile.accentColor,
          "--tape-color": profile.tapeColor,
        } as React.CSSProperties
      }
    >
      <span className={styles.tape} aria-hidden="true" />
      <span className={styles.tapeAlt} aria-hidden="true" />
      <span
        className={`mono-label ${styles.stamp} ${styles.connectStamp}`}
        style={{ "--stamp-opacity": connectOpacity } as React.CSSProperties}
        aria-hidden="true"
      >
        connect
      </span>
      <span
        className={`mono-label ${styles.stamp} ${styles.passStamp}`}
        style={{ "--stamp-opacity": passOpacity } as React.CSSProperties}
        aria-hidden="true"
      >
        pass
      </span>

      <div className={styles.cardBody}>
        <div className={styles.profileTop}>
          <div className={styles.photo} aria-hidden="true">
            <div className={styles.portrait}>
              <CommunityAvatar variant={profile.avatarVariant} name={profile.name} />
            </div>
          </div>

          <div>
            <h2 className={`sketch-display ${styles.name}`}>{profile.name}</h2>
            <span className={`mono-label ${styles.role}`}>{profile.role}</span>
          </div>
        </div>

        <p className={`sketch-body ${styles.bio}`}>{profile.bio}</p>

        <div className={styles.noteStack}>
          <SkillNote
            title="They can teach you"
            skills={match.theyCanTeachYou}
            emptyLabel="Not on your list yet"
            color={profile.accentColor}
            rotate={-0.45}
          />
          <SkillNote
            title={`${profile.name} wants to learn`}
            skills={profile.wantsToLearn}
            emptyLabel="Open studio practice"
            color="var(--sticky-note)"
            rotate={0.35}
          />
          <SkillNote
            title="You can teach"
            skills={match.youCanTeachThem}
            emptyLabel="No overlap yet"
            color="var(--tape-pink)"
            rotate={-0.2}
          />
        </div>

        <div
          className={`${styles.badge} ${
            match.isMutual ? "" : styles.badgeSecondary
          }`}
        >
          <LineIcon glyph={profile.glyph} size={24} />
          <span>
            {match.isMutual
              ? "Mutual learning match"
              : "Useful peer connection"}
          </span>
        </div>
      </div>
    </article>
  );
}

function SkillNote({
  title,
  skills,
  emptyLabel,
  color,
  rotate,
}: {
  title: string;
  skills: string[];
  emptyLabel: string;
  color: string;
  rotate: number;
}) {
  const visibleSkills = skills.length ? skills : [emptyLabel];

  return (
    <section
      className={`${styles.note} ${skills.length ? "" : styles.noteMuted}`}
      style={
        {
          "--note-color": color,
          transform: `rotate(${rotate}deg)`,
        } as React.CSSProperties
      }
    >
      <span className={`mono-label ${styles.noteTitle}`}>{title}</span>
      <div className={styles.chipRow}>
        {visibleSkills.map((skill) => (
          <span
            key={skill}
            className={`sketch-body ${styles.skillChip} ${
              skills.length ? "" : styles.skillChipMuted
            }`}
          >
            {skill}
          </span>
        ))}
      </div>
    </section>
  );
}

function EmptyDeck({ onReset }: { onReset: () => void }) {
  return (
    <section className={styles.emptyNote}>
      <h2 className={`sketch-display ${styles.emptyTitle}`}>
        All artist cards reviewed.
      </h2>
      <p className={`sketch-body ${styles.emptyCopy}`}>
        Take another pass whenever you feel ready.
      </p>
      <div style={{ marginTop: 18 }}>
        <AtelierButton
          label="review stack"
          onTap={onReset}
          fill="var(--ink)"
          textColor="var(--paper-light)"
          tapeColor="var(--tape-green)"
          fontSize={14}
        />
      </div>
    </section>
  );
}

function LearningMatchModal({
  profile,
  onClose,
}: {
  profile: PeerProfile;
  onClose: () => void;
}) {
  const match = getPeerMatch(demoLearner, profile);

  return (
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="learning-match-title"
        onClick={(event) => event.stopPropagation()}
        style={{ "--modal-tape": profile.tapeColor } as React.CSSProperties}
      >
        <span className={styles.modalTape} aria-hidden="true" />
        <div className={styles.modalIcon}>
          <LineIcon glyph={profile.glyph} size={42} />
        </div>
        <h2
          id="learning-match-title"
          className={`sketch-display ${styles.modalTitle}`}
        >
          It&apos;s a learning match!
        </h2>
        <p className={`sketch-body ${styles.modalCopy}`}>
          You and {profile.name} have something to trade.
        </p>
        <div className={styles.matchLines}>
          <MatchLine
            title={`${profile.name} can teach you`}
            skills={match.theyCanTeachYou}
            color={profile.accentColor}
          />
          <MatchLine
            title={`You can teach ${profile.name}`}
            skills={match.youCanTeachThem}
            color="var(--yellow)"
          />
        </div>
        <div className={styles.modalAction}>
          <AtelierButton
            label="start learning together"
            onTap={onClose}
            fill="var(--ink)"
            textColor="var(--paper-light)"
            tapeColor="var(--tape-green)"
            fontSize={14}
          />
        </div>
      </section>
    </div>
  );
}

function MatchLine({
  title,
  skills,
  color,
}: {
  title: string;
  skills: string[];
  color: string;
}) {
  return (
    <div
      className={styles.matchLine}
      style={{ "--line-color": color } as React.CSSProperties}
    >
      <span className={`mono-label ${styles.matchTitle}`}>{title}</span>
      <div className={`sketch-body ${styles.matchSkills}`}>
        {skills.join(", ")}
      </div>
    </div>
  );
}
