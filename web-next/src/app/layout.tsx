import type { Metadata } from "next";
import { Caveat, Karla, Archivo, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// Ported 1:1 from lib/theme/app_theme.dart's Google Fonts choices.
const sketch = Caveat({ variable: "--font-sketch", subsets: ["latin"], weight: ["700"] });
const karla = Karla({ variable: "--font-karla", subsets: ["latin"] });
const editorial = Archivo({ variable: "--font-editorial", subsets: ["latin"], weight: ["800"] });
const mono = IBM_Plex_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["600"] });

export const metadata: Metadata = {
  title: "Wonderly",
  description: "Start with wonder.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sketch.variable} ${karla.variable} ${editorial.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}

