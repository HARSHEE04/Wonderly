"use client";

import { useRouter } from "next/navigation";
import { AtelierButton } from "@/components/AtelierButton";
import { LineIcon } from "@/components/LineIcon";

/** Ports lib/screens/saved_screen.dart. */
export default function SavedPage() {
  const router = useRouter();

  return (
    <div className="page">
      <div className="page-content" style={{ justifyContent: "center", alignItems: "center", textAlign: "center", gap: 4 }}>
        <LineIcon glyph="spark" size={56} color="var(--pink-deep)" />
        <div style={{ height: 22 }} />
        <span className="mono-label">saved to your library</span>
        <div style={{ height: 10 }} />
        <h1 className="editorial-display" style={{ fontSize: 26 }}>
          Another page in your journey.
        </h1>
        <div style={{ height: 36 }} />
        <div style={{ width: "100%" }}>
          <AtelierButton label="view library" fill="var(--ink)" onTap={() => router.push("/library")} />
          <div style={{ height: 12 }} />
          <AtelierButton label="back to home" outlined onTap={() => router.push("/")} />
        </div>
      </div>
    </div>
  );
}
