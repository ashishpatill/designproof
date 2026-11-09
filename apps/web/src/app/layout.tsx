import type { Metadata } from "next";
import { IBM_Plex_Mono, Instrument_Serif, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-source-sans",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Design Proof — Every AI-built page has a tell",
  description:
    "Design Proof captures your page, names what makes it look generic, directs a better design, repairs your code, and proves the fix. Free to start.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${sourceSans.variable} ${ibmPlexMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
