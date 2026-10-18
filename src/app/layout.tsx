import type { Metadata, Viewport } from "next";
import { Bagel_Fat_One, Pixelify_Sans, VT323 } from "next/font/google";
import NibLayer from "@/components/nib/NibLayer";
import NibVoice from "@/components/nib/NibVoice";
import SoundEffects from "@/components/shell/SoundEffects";
import "./globals.css";

const display = Bagel_Fat_One({ weight: "400", subsets: ["latin", "latin-ext"], variable: "--font-display-next", display: "swap" });
const ui = Pixelify_Sans({ subsets: ["latin"], variable: "--font-ui-next", display: "swap" });
const mono = VT323({ weight: "400", subsets: ["latin"], variable: "--font-mono-next", display: "swap" });

export const metadata: Metadata = {
  title: "nib · baby's first cursor",
  description: "Click gently. I'm new here. A newborn cursor discovering the internet, one click at a time.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

const themeScript = `(function(){try{var t=localStorage.getItem('nib:theme');if(t!=='day'&&t!=='night'){t=matchMedia('(prefers-color-scheme: dark)').matches?'night':'day'}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='day'}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${display.variable} ${ui.variable} ${mono.variable}`}>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>
        {children}
        <NibLayer />
        <NibVoice />
        <SoundEffects />
      </body>
    </html>
  );
}
