import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://fastdata.vercel.app"),
  title: "Fastdata — Buy Cheap Data Bundles in Ghana",
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
  applicationName: "Fastdata",
  authors: [{ name: "Fastdata" }],
  creator: "Fastdata",
  publisher: "Fastdata",
  robots: { index: true, follow: true, "max-image-preview": "large" },
  openGraph: {
    type: "website",
    locale: "en_GH",
    url: "https://fastdata.vercel.app",
    siteName: "Fastdata",
    title: "Fastdata — Buy Cheap Data Bundles in Ghana",
    description:
      "Ghana's affordable data bundles. Buy MTN and Telecel data instantly. Non-expiry, no account needed, pay via MoMo.",
    images: [{ url: "/fastdata-logo.png", width: 512, height: 512, alt: "Fastdata" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fastdata — Buy Cheap Data Bundles in Ghana",
    description: "Ghana's affordable data bundles. Buy MTN and Telecel data instantly.",
    images: ["/fastdata-logo.png"],
  },
  icons: { icon: "/fastdata-logo.png", apple: "/fastdata-logo.png" },
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
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text)]">{children}</body>
    </html>
  );
}