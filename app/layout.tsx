import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ToastProvider } from "@/components/toast";
import "./globals.css";

const baseUrl = "https://vitaliq.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "Vitaliq - Modern Health Analytics & Insights",
    template: "%s | Vitaliq"
  },
  description: "A modern, secure health analytics platform for tracking, understanding, and improving your long-term health metrics.",
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "Vitaliq - Modern Health Analytics & Insights",
    description: "A modern, secure health analytics platform for tracking, understanding, and improving your long-term health metrics.",
    url: baseUrl,
    siteName: "Vitaliq",
    images: [
      {
        url: "/opengraph-image.jpg",
        width: 1200,
        height: 630,
        alt: "Vitaliq Health Dashboard Preview"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Vitaliq - Modern Health Analytics & Insights",
    description: "A modern, secure health analytics platform for tracking, understanding, and improving your long-term health metrics.",
    images: ["/opengraph-image.jpg"]
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body>
          <ToastProvider>
            {children}
          </ToastProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
