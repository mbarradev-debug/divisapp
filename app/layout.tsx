import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}
      >
        <div className="mx-auto max-w-md min-h-screen">
          <header className="px-4 py-6">
            <h1 className="text-xl font-semibold">DivisApp</h1>
          </header>
          <main className="px-4 pb-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
