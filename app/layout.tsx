import type { Metadata, Viewport } from "next";
import { Anuphan } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SpaceDecor } from "@/components/space-decor";
import "./globals.css";

const anuphan = Anuphan({
  variable: "--font-anuphan",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "TripSync",
  description: "Find the dates, the budget, and the place — without the group-chat chaos.",
};

export const viewport: Viewport = {
  themeColor: "#0A0E1A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${anuphan.variable} h-full antialiased`}>
      <body className="min-h-full overflow-x-hidden">
        <SpaceDecor />
        <div className="relative z-1 flex min-h-screen flex-col">
          <SiteHeader />
          {children}
        </div>
      </body>
    </html>
  );
}
