import { NextRequest, NextResponse } from "next/server";

// Keep in sync with ReadAloudButton's fetch("/api/tts", ...) contract.
const MAX_TEXT_LENGTH = 2000;
const ELEVENLABS_TTS_URL = "https://api.elevenlabs.io/v1/text-to-speech";
// ElevenLabs' public "Rachel" voice — used only if ELEVENLABS_VOICE_ID isn't set.
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const text = (body as { text?: unknown } | null)?.text;
  if (typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "Text is required." }, { status: 400 });
  }
  const trimmed = text.trim();
  if (trimmed.length > MAX_TEXT_LENGTH) {
    return NextResponse.json({ error: "Text is too long." }, { status: 413 });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error("POST /api/tts: ELEVENLABS_API_KEY is not configured.");
    return NextResponse.json({ error: "Audio is unavailable right now. Please try again." }, { status: 500 });
  }
  const voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID;

  try {
    const elevenRes = await fetch(`${ELEVENLABS_TTS_URL}/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: trimmed,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    });

    if (!elevenRes.ok) {
      const detail = await elevenRes.text().catch(() => "");
      console.error(`POST /api/tts: ElevenLabs request failed (${elevenRes.status}): ${detail}`);
      return NextResponse.json({ error: "Audio is unavailable right now. Please try again." }, { status: 502 });
    }

    const audioBuffer = await elevenRes.arrayBuffer();
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("POST /api/tts: unexpected error calling ElevenLabs", err);
    return NextResponse.json({ error: "Audio is unavailable right now. Please try again." }, { status: 500 });
  }
}
