import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50`}
      >
        <div className="mx-auto min-h-screen max-w-2xl">
          <header className="sticky top-0 z-10 border-b border-zinc-200 bg-zinc-50/80 px-4 py-4 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80 sm:px-6">
            <nav className="flex items-center justify-between">
              <Link
                href="/"
                className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
              >
                DivisApp
              </Link>
              <Link
                href="/convert"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
              >
                Convertir
              </Link>
            </nav>
          </header>
          <main className="px-4 py-6 sm:px-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
