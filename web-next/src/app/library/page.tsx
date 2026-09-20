"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { BackButton } from "@/components/AtelierButton";
import { LineIcon } from "@/components/LineIcon";
import { libraryStore } from "@/lib/appState";
import { getArtworks, demoUserId } from "@/lib/apiClient";
import type { LibraryEntry } from "@/lib/types";

/** Ports lib/screens/library_screen.dart. */
export default function LibraryPage() {
  const router = useRouter();
  const items = useSyncExternalStore(libraryStore.subscribe, libraryStore.getSnapshot, libraryStore.getSnapshot);

  useEffect(() => {
    getArtworks(demoUserId)
      .then((artworks) => libraryStore.mergeRemote(artworks))
      .catch(() => {
        // offline — local entries still render
      });
  }, []);

  return (
    <div className="page">
      <div className="page-content" style={{ paddingTop: 8 }}>
        <BackButton onTap={() => router.back()} />
        <div style={{ height: 8 }} />
        <h1 className="sketch-display" style={{ fontSize: 34 }}>
          your library
        </h1>
        <div style={{ height: 6 }} />
        <p className="sketch-body" style={{ fontSize: 15 }}>
          {items.length} pages in your creative journey
        </p>
        <div style={{ height: 18 }} />
        {items.length === 0 ? (
          <span className="mono-label">nothing here yet</span>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {items.map((entry, i) => (
              <LibraryCard key={entry.id} entry={entry} tiltRight={i % 2 === 0} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LibraryCard({ entry, tiltRight }: { entry: LibraryEntry; tiltRight: boolean }) {
  const tapeColor = entry.origin === "Create" ? "var(--tape-purple)" : "var(--tape-green)";
  return (
    <div
      style={{
        position: "relative",
        transform: `rotate(${tiltRight ? 1.5 : -1.5}deg)`,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: -10,
          left: "50%",
          marginLeft: -8,
          width: 16,
          height: 30,
          background: tapeColor,
          opacity: 0.85,
          borderRadius: 2,
          zIndex: 1,
        }}
      />
      <div
        style={{
          background: "var(--paper-light)",
          borderRadius: 16,
          boxShadow: "0 8px 16px rgba(20,22,58,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            aspectRatio: "1.1",
            background: entry.photoTint,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {entry.photoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={entry.photoDataUrl} alt={entry.challengeTitle} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <LineIcon glyph={entry.photoGlyph as never} size={44} color="rgba(20,22,58,0.6)" />
          )}
        </div>
        <div style={{ padding: 10 }}>
          <div className="sketch-body" style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>
            {entry.challengeTitle}
          </div>
          <div className="mono-label" style={{ fontSize: 10 }}>
            {new Date(entry.date).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}
