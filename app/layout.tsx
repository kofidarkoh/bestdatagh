import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://data4you.vercel.app"),
  title: "data4you — Buy Cheap Data Bundles in Ghana",
  description:
    "Ghana's affordable data bundles. Buy MTN and Telecel data instantly from GH₵5. Non-expiry bundles, no account needed, pay via MoMo with Paystack. Fast delivery.",
  keywords: [
    "buy data bundles Ghana",
    "cheap data Ghana",
    "MTN data bundles",
    "Telecel data bundles",
    "non expiry data Ghana",
    "instant data delivery",
    "buy data without account",
    "mobile money data Ghana",
    "affordable data bundles",
  ],
  applicationName: "data4you",
  authors: [{ name: "data4you" }],
  creator: "data4you",
  publisher: "data4you",
  robots: { index: true, follow: true, "max-image-preview": "large" },
  openGraph: {
    type: "website",
    locale: "en_GH",
    url: "https://data4you.vercel.app",
    siteName: "data4you",
    title: "data4you — Buy Cheap Data Bundles in Ghana",
    description:
      "Ghana's affordable data bundles. Buy MTN and Telecel data instantly. Non-expiry, no account needed, pay via MoMo.",

  },
  twitter: {
    card: "summary_large_image",
    title: "data4you — Buy Cheap Data Bundles in Ghana",
    description: "Ghana's affordable data bundles. Buy MTN and Telecel data instantly.",

  },

  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export const viewport = {
  themeColor: "#dc2626",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable + " " + geistMono.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "data4you",
              url: "https://data4you.vercel.app",

              description: "Ghana data bundles and SIM services. Pay securely with Paystack, delivered fast.",
              areaServed: { "@type": "Country", name: "Ghana" },
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}