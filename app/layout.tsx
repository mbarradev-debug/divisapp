import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { ConvertLink } from "@/components/navigation/convert-link";
import { UserStateIndicator } from "@/components/navigation/user-state-indicator";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DivisApp",
  description: "DivisApp - Mobile Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-bg text-text`}
      >
        <div className="mx-auto min-h-screen max-w-2xl">
          <header className="sticky top-0 z-10 border-b border-border bg-bg/80 px-4 py-4 backdrop-blur-sm sm:px-6">
            <nav className="flex items-center justify-between">
              <Link
                href="/"
                className="text-[length:var(--text-section)] font-semibold leading-[var(--leading-section)] text-text"
              >
                DivisApp
              </Link>
              <div className="flex items-center gap-2">
                <UserStateIndicator />
                <ConvertLink />
              </div>
            </nav>
          </header>
          <main className="px-4 py-6 sm:px-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
