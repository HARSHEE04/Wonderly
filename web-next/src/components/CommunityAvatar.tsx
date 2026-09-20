"use client";

import type { AvatarVariant } from "@/lib/peerLearning";

const COMMON = {
  viewBox: "0 0 96 96",
  width: "100%",
  height: "100%",
  role: "img" as const,
};

export function CommunityAvatar({ variant, name }: { variant: AvatarVariant; name: string }) {
  return (
    <svg {...COMMON} aria-label={`${name} profile illustration`}>
      <rect width="96" height="96" rx="10" fill={backgroundFor(variant)} />
      {variant === "sunny" && <SunnyAvatar />}
      {variant === "violet" && <VioletAvatar />}
      {variant === "teal" && <TealAvatar />}
      {variant === "coral" && <CoralAvatar />}
      {variant === "blue" && <BlueAvatar />}
    </svg>
  );
}

function backgroundFor(variant: AvatarVariant) {
  return {
    sunny: "#fbeac9",
    violet: "#e9ddf7",
    teal: "#dceeee",
    coral: "#f8dedd",
    blue: "#dce8f3",
  }[variant];
}

function Head({ skin, hair, shirt }: { skin: string; hair: string; shirt: string }) {
  return (
    <g stroke="#14163a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 96c2-20 16-28 28-28s26 8 28 28" fill={shirt} />
      <path d="M39 63v12c5 5 13 5 18 0V63" fill={skin} />
      <path d="M28 41c0-15 8-24 20-24s20 9 20 24c0 14-8 25-20 25S28 55 28 41Z" fill={skin} />
      <path d="M28 39c-3-18 8-28 21-28 15 0 23 10 18 30-2-8-6-13-13-17-8 9-16 12-26 15Z" fill={hair} />
      <circle cx="42" cy="43" r="1.5" fill="#14163a" stroke="none" />
      <circle cx="55" cy="43" r="1.5" fill="#14163a" stroke="none" />
      <path d="M44 53c3 2 6 2 9 0" fill="none" />
    </g>
  );
}

function SunnyAvatar() {
  return <g><circle cx="74" cy="20" r="9" fill="#fbe87d" stroke="#14163a" strokeWidth="1.5" /><Head skin="#d88e68" hair="#2b1d2a" shirt="#e0615e" /></g>;
}

function VioletAvatar() {
  return <g><path d="M12 75c12-12 18-14 28-9" fill="none" stroke="#4e8e91" strokeWidth="3" /><Head skin="#ad6f52" hair="#3c2b20" shirt="#4e8e91" /></g>;
}

function TealAvatar() {
  return <g><path d="M74 13c8 5 10 12 8 20" fill="none" stroke="#2f7d5a" strokeWidth="5" strokeLinecap="round" /><Head skin="#edb38e" hair="#e0615e" shirt="#fbe87d" /></g>;
}

function CoralAvatar() {
  return <g><circle cx="20" cy="24" r="7" fill="#7ec6ca" stroke="#14163a" strokeWidth="1.5" /><Head skin="#7e4d42" hair="#14163a" shirt="#efb546" /></g>;
}

function BlueAvatar() {
  return <g><path d="M72 14l7 6-7 6-7-6 7-6Z" fill="#e0615e" stroke="#14163a" strokeWidth="1.5" /><Head skin="#c98768" hair="#71543f" shirt="#7ec6ca" /></g>;
}
