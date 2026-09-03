import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Habitat | Find a place worth coming home to",
  description:
    "Curated homes, apartments, and spaces for the way you want to live.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
      style={{ colorScheme: "light dark" }}
    >
      <head>
        <meta
          name="theme-color"
          content="hsl(0 0% 100%)"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="hsl(0 0% 3.9%)"
          media="(prefers-color-scheme: dark)"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
