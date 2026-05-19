import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://invoice-generator.local";

const TITLE = "Invoice Generator — Free Online Invoice Maker with PDF Export";
const DESCRIPTION =
  "Create professional invoices in seconds. Fill in your business details, add line items, and download a clean PDF invoice. Works fully in your browser — no signup, no backend. Saved drafts stay on your device via localStorage.";

const KEYWORDS = [
  "invoice generator",
  "free invoice generator",
  "online invoice maker",
  "invoice pdf",
  "create invoice",
  "billing tool",
  "receipt generator",
  "freelance invoice",
  "small business invoice",
  "invoice template",
];

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s | Invoice Generator",
  },
  description: DESCRIPTION,
  keywords: KEYWORDS,
  applicationName: "Invoice Generator",
  authors: [{ name: "Invoice Generator" }],
  creator: "Invoice Generator",
  publisher: "Invoice Generator",
  generator: "Next.js",
  category: "productivity",
  referrer: "origin-when-cross-origin",
  alternates: {
    canonical: "/",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Invoice Generator",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eff6ff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  colorScheme: "light",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Invoice Generator",
  description: DESCRIPTION,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Any (web browser)",
  url: SITE_URL,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "Create invoices from a simple form",
    "Download a polished PDF",
    "Save drafts locally with no signup",
  ],
  browserRequirements: "Requires JavaScript. Requires HTML5.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
