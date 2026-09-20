"use client";

import { useRouter } from "next/navigation";
import { BackButton, AtelierButton } from "@/components/AtelierButton";
import { LineIcon } from "@/components/LineIcon";

/** Ports lib/screens/create_reminder_screen.dart. */
export default function CreateReminderPage() {
  const router = useRouter();

  return (
    <div className="page">
      <div className="page-content" style={{ paddingTop: 4 }}>
        <BackButton onTap={() => router.back()} />
        <div style={{ height: 100 }} />
        <div style={{ display: "flex", justifyContent: "center" }}>
          <LineIcon glyph="spark" size={48} color="var(--pink-deep)" />
        </div>
        <div style={{ height: 22 }} />
        <p className="mono-label" style={{ textAlign: "center" }}>
          creation reminder
        </p>
        <div style={{ height: 10 }} />
        <h1 className="editorial-display" style={{ fontSize: 26, textAlign: "center" }}>
          Step away from the screen.
        </h1>
        <div style={{ height: 10 }} />
        <p className="sketch-body" style={{ fontSize: 16, textAlign: "center" }}>
          Create outside the app, with paper, an iPad, Procreate, whatever feels right. Come back when you&apos;re
          holding something finished.
        </p>
        <div style={{ height: 100 }} />
        <AtelierButton label="i'm done" fill="var(--ink)" onTap={() => router.push("/capture")} />
      </div>
    </div>
  );
}
