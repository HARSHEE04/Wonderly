"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Status = "idle" | "loading" | "playing" | "error";

// Only one narration should ever play at a time across the app; whichever
// ReadAloudButton starts next stops whatever the previous one was playing.
let activeStopper: (() => void) | null = null;

/**
 * Reusable read-aloud control. Callers pass the exact text to narrate —
 * this never scrapes the page. Generated audio is cached per instance for
 * the current text; changing `text` invalidates the cache and generates
 * fresh audio on the next press.
 */
export function ReadAloudButton({ text }: { text: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cachedTextRef = useRef<string | null>(null);
  const cachedUrlRef = useRef<string | null>(null);
  const requestInFlightRef = useRef(false);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    setStatus((s) => (s === "playing" ? "idle" : s));
  }, []);

  const releaseCache = useCallback(() => {
    audioRef.current?.pause();
    if (cachedUrlRef.current) URL.revokeObjectURL(cachedUrlRef.current);
    cachedUrlRef.current = null;
    cachedTextRef.current = null;
    audioRef.current = null;
  }, []);

  // Text changed under us (e.g. concept navigation without unmount) — drop the stale cache.
  useEffect(() => {
    if (cachedTextRef.current !== null && cachedTextRef.current !== text.trim()) {
      if (activeStopper === stop) activeStopper = null;
      releaseCache();
      setStatus("idle");
      setErrorMessage(null);
    }
  }, [text, stop, releaseCache]);

  // Leaving the page: stop playback and release the object URL.
  useEffect(() => {
    return () => {
      if (activeStopper === stop) activeStopper = null;
      releaseCache();
    };
  }, [stop, releaseCache]);

  async function handleClick() {
    if (status === "loading" || requestInFlightRef.current) return;

    if (status === "playing") {
      stop();
      if (activeStopper === stop) activeStopper = null;
      return;
    }

    const trimmed = text.trim();
    setErrorMessage(null);
    if (!trimmed) {
      setStatus("error");
      setErrorMessage("There's nothing to read on this page yet.");
      return;
    }

    if (cachedTextRef.current === trimmed && audioRef.current) {
      const audio = audioRef.current;
      audio.currentTime = 0;
      try {
        activeStopper?.();
        activeStopper = stop;
        await audio.play();
        setStatus("playing");
      } catch {
        setStatus("error");
        setErrorMessage("Audio is unavailable right now. Please try again.");
      }
      return;
    }

    requestInFlightRef.current = true;
    setStatus("loading");
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });
      if (!res.ok) throw new Error(`tts request failed (${res.status})`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      if (cachedUrlRef.current) URL.revokeObjectURL(cachedUrlRef.current);
      cachedUrlRef.current = url;
      cachedTextRef.current = trimmed;

      const audio = new Audio(url);
      audio.onended = () => {
        setStatus("idle");
        if (activeStopper === stop) activeStopper = null;
      };
      audioRef.current = audio;

      activeStopper?.();
      activeStopper = stop;

      await audio.play();
      setStatus("playing");
    } catch (err) {
      console.error("ReadAloudButton: failed to play narration", err);
      releaseCache();
      setStatus("error");
      setErrorMessage("Audio is unavailable right now. Please try again.");
    } finally {
      requestInFlightRef.current = false;
    }
  }

  const label = status === "loading" ? "Loading audio…" : status === "playing" ? "⏹ Press to stop audio" : "🔊 Press for audio";
  const ariaLabel = status === "playing" ? "Stop audio" : "Read page aloud";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
      <button
        type="button"
        onClick={handleClick}
        disabled={status === "loading"}
        aria-label={ariaLabel}
        className="mono-label"
        style={{
          padding: "10px 18px",
          borderRadius: 20,
          border: "1.4px solid rgba(20,22,58,0.25)",
          background: status === "playing" ? "var(--ink)" : "var(--paper-tile)",
          color: status === "playing" ? "var(--paper-light)" : "var(--ink)",
          cursor: status === "loading" ? "default" : "pointer",
          fontSize: 12.5,
        }}
      >
        {label}
      </button>
      {status === "error" && errorMessage && (
        <span className="sketch-body" style={{ fontSize: 12.5, color: "var(--pink-deep)" }}>
          {errorMessage}
        </span>
      )}
    </div>
  );
}
