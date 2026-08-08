import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cat Defender: Ghép 3 Bắn Súng",
  description: "Game ghép 3 kiểu bắn súng với nhân vật mèo, đấu solo với AI",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-slate-950">{children}</body>
    </html>
  );
}
