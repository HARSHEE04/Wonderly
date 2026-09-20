"use client";

import type { ArtworkVariant } from "@/lib/types";

const COMMON = {
  viewBox: "0 0 220 170",
  width: "100%",
  height: "100%",
  preserveAspectRatio: "xMidYMid slice" as const,
};

export function ArtworkPreview({ variant, title }: { variant: ArtworkVariant; title: string }) {
  return (
    <svg {...COMMON} role="img" aria-label={`${title} artwork preview`}>
      {variant === "marigold" && <MarigoldStudy />}
      {variant === "symmetry" && <SymmetryStudy />}
      {variant === "blue-green" && <BlueGreenStudy />}
      {variant === "perspective" && <PerspectiveStudy />}
    </svg>
  );
}

function MarigoldStudy() {
  return (
    <g>
      <rect width="220" height="170" fill="#f8e9c9" />
      <rect x="18" y="18" width="184" height="134" rx="3" fill="#fff8e8" stroke="#14163a" strokeWidth="2" />
      <path d="M34 126h152" stroke="#14163a" strokeWidth="2" />
      <path d="M44 116c30-19 51-19 77-4 22 13 38 11 54-7" fill="none" stroke="#e0615e" strokeWidth="5" strokeLinecap="round" />
      <circle cx="106" cy="73" r="23" fill="#fbe87d" stroke="#14163a" strokeWidth="2" />
      <g fill="#efb546" stroke="#14163a" strokeWidth="1.4">
        <ellipse cx="106" cy="42" rx="9" ry="18" />
        <ellipse cx="106" cy="104" rx="9" ry="18" />
        <ellipse cx="75" cy="73" rx="18" ry="9" />
        <ellipse cx="137" cy="73" rx="18" ry="9" />
        <ellipse cx="84" cy="51" rx="10" ry="17" transform="rotate(-45 84 51)" />
        <ellipse cx="128" cy="95" rx="10" ry="17" transform="rotate(-45 128 95)" />
        <ellipse cx="128" cy="51" rx="10" ry="17" transform="rotate(45 128 51)" />
        <ellipse cx="84" cy="95" rx="10" ry="17" transform="rotate(45 84 95)" />
      </g>
      <circle cx="106" cy="73" r="9" fill="#e0615e" stroke="#14163a" strokeWidth="2" />
      <path d="M43 35h50M43 45h34" stroke="#2f7d5a" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

function SymmetryStudy() {
  return (
    <g>
      <rect width="220" height="170" fill="#dceeee" />
      <rect x="18" y="14" width="184" height="142" rx="4" fill="#f8f4e8" stroke="#14163a" strokeWidth="2" />
      <path d="M110 25v120" stroke="#7ec6ca" strokeWidth="2" strokeDasharray="5 5" />
      <path d="M110 120c-9-20-29-25-39-43 14 0 29 8 39 24M110 120c9-20 29-25 39-43-14 0-29 8-39 24" fill="none" stroke="#2f7d5a" strokeWidth="4" strokeLinecap="round" />
      <path d="M110 103c-12-18-29-21-42-16M110 103c12-18 29-21 42-16" fill="none" stroke="#4e8e91" strokeWidth="3" strokeLinecap="round" />
      <g fill="#ea8886" stroke="#14163a" strokeWidth="1.5">
        <path d="M110 46c-17-18-37 4 0 25 37-21 17-43 0-25Z" />
        <circle cx="72" cy="72" r="8" />
        <circle cx="148" cy="72" r="8" />
      </g>
      <path d="M72 125h76" stroke="#efb546" strokeWidth="7" strokeLinecap="round" />
    </g>
  );
}

function BlueGreenStudy() {
  return (
    <g>
      <rect width="220" height="170" fill="#c9e8e7" />
      <rect x="17" y="14" width="186" height="142" rx="5" fill="#f7f3e7" stroke="#14163a" strokeWidth="2" />
      <path d="M42 112c18-30 43-31 58-4s39 26 71-12" fill="none" stroke="#2f7d5a" strokeWidth="10" strokeLinecap="round" />
      <path d="M39 48c29 15 45 14 64-5s40-20 77 4" fill="none" stroke="#4e8e91" strokeWidth="7" strokeLinecap="round" />
      <circle cx="63" cy="76" r="20" fill="#7ec6ca" stroke="#14163a" strokeWidth="3" />
      <circle cx="112" cy="87" r="32" fill="#2f7d5a" fillOpacity="0.8" stroke="#14163a" strokeWidth="3" />
      <circle cx="165" cy="60" r="14" fill="#fbe87d" stroke="#14163a" strokeWidth="3" />
      <path d="M43 133c22-8 45-8 68 0s43 8 66 0" fill="none" stroke="#e0615e" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

function PerspectiveStudy() {
  return (
    <g>
      <rect width="220" height="170" fill="#f8dedd" />
      <rect x="16" y="14" width="188" height="142" rx="4" fill="#fff8e8" stroke="#14163a" strokeWidth="2" />
      <circle cx="154" cy="43" r="15" fill="#fbe87d" stroke="#14163a" strokeWidth="2" />
      <path d="M34 128h152M110 75L43 128M110 75l69 53M110 75v53" stroke="#14163a" strokeWidth="2" fill="none" />
      <path d="M62 112h96M76 99h68M89 88h42" stroke="#7ec6ca" strokeWidth="3" strokeLinecap="round" />
      <path d="M62 112v16M158 112v16M76 99v29M144 99v29M89 88v40M131 88v40" stroke="#4e8e91" strokeWidth="3" />
      <path d="M42 128v-40h34l34-13v53z" fill="#efb546" fillOpacity="0.75" stroke="#14163a" strokeWidth="2" />
      <path d="M76 88v40M76 98h34" stroke="#14163a" strokeWidth="2" />
    </g>
  );
}
