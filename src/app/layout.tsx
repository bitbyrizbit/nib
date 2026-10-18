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
  metadataBase: new URL("https://meet-nib.vercel.app"),
  title: "nib · baby's first cursor",
  description: "Click gently. I'm new here. A newborn cursor discovering the internet, one click at a time.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "nib · baby's first cursor",
    description: "Click gently. I'm new here. A newborn cursor discovering the internet, one click at a time.",
    url: "https://meet-nib.vercel.app",
    siteName: "NIB",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "nib · baby's first cursor",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "nib · baby's first cursor",
    description: "Click gently. I'm new here. A newborn cursor discovering the internet, one click at a time.",
    images: ["/og.png"],
  },
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
