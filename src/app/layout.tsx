import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Brigee Braids",
    template: "%s | Brigee Braids",
  },
  description:
    "Premium hair braiding in Gosford & the Central Coast. Book online, upload inspiration photos, and receive AI style suggestions.",
  keywords: ["hair braiding", "Gosford", "Central Coast", "NSW", "knotless braids", "box braids"],
  authors: [{ name: "Brigee Braids" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Brigee Braids",
  },
  openGraph: {
    type: "website",
    siteName: "Brigee Braids",
    title: "Brigee Braids — Premium Hair Braiding",
    description: "Book your braiding appointment online. AI style suggestions, real-time availability, secure payments.",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-AU" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
