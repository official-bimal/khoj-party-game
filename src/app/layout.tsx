import type { Metadata, Viewport } from "next";
import { Shell } from "@/components/shell";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "KHOJ — Sathi ho ki imposter?", template: "%s | KHOJ" },
  description:
    "The Nepali party game of clues, bluffing and suspicious friends. Play offline around one phone or create a private online room. No signup needed.",
  applicationName: "KHOJ",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "KHOJ",
  },
  openGraph: {
    title: "KHOJ — Who is the Imposter?",
    description:
      "One secret. A room full of suspects. A Nepali-first party game.",
    type: "website",
  },
  robots: { index: true, follow: true },
  icons: { icon: "/icons/icon.svg", apple: "/icons/icon-192.png" },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#141622",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ne-Latn">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "KHOJ",
              applicationCategory: "GameApplication",
              operatingSystem: "Web browser",
              inLanguage: ["ne", "ne-Latn", "en"],
              description:
                "A Nepali-first social deduction party game for 3–20 friends.",
              offers: { "@type": "Offer", price: "0", priceCurrency: "NPR" },
            }),
          }}
        />
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
