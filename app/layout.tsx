import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import "./globals.css";
import "@mysten/dapp-kit/dist/index.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Walrus Estate · Sui Data Game",
  description:
    "Gamified data estates on Sui & Walrus – connect your wallet, manage data nodes, and explore on-chain data economics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="min-h-screen bg-walrus-dark text-slate-100">
            <header className="border-b border-slate-800/80 bg-black/40 backdrop-blur-sm">
              <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3 lg:px-6">
                <div className="flex items-center gap-2">
                  <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-slate-700 bg-black/60">
                    <Image
                      src="/images/walrus_estate.png"
                      alt="Walrus Estate logo"
                      fill
                      sizes="28px"
                      className="object-cover"
                      priority
                    />
                  </div>
                  <span className="text-xs font-semibold tracking-[0.25em] uppercase text-slate-300">
                    Walrus Estate
                  </span>
                </div>
                <nav className="flex items-center gap-3 text-xs font-mono text-slate-300">
                  <a
                    href="/"
                    className="px-2 py-1 rounded-md hover:bg-slate-800/70 transition-colors"
                  >
                    Home
                  </a>
                  <a
                    href="/game"
                    className="px-2 py-1 rounded-md hover:bg-slate-800/70 transition-colors"
                  >
                    Game
                  </a>
                </nav>
              </div>
            </header>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
