import type { Metadata, Viewport } from "next";
import { get } from "@/lib/db";
import "./globals.css";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await get("settings");
  return {
    title: { default: s.seoTitle, template: `%s — ${s.brandName} ${s.brandSuffix}` },
    description: s.seoDescription,
    openGraph: { title: s.seoTitle, description: s.seoDescription, type: "website" },
  };
}

export const viewport: Viewport = {
  themeColor: "#efeeea",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await get("settings");
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{`:root{--accent:${s.accent};--accent-ink:${s.accentInk};}`}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
