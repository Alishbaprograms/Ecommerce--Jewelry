import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/store/cart-drawer";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Zohraé — Fine Jewelry for Life's Precious Moments",
    template: "%s | Zohraé",
  },
  description:
    "Discover handcrafted fine jewelry. Rings, necklaces, earrings, and bracelets designed for the modern woman. Free shipping on orders over $150.",
  keywords: [
    "jewelry",
    "fine jewelry",
    "rings",
    "necklaces",
    "earrings",
    "bracelets",
    "gold jewelry",
    "luxury jewelry",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Zohraé",
    title: "Zohraé — Fine Jewelry for Life's Precious Moments",
    description: "Discover handcrafted fine jewelry designed for the modern woman.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zohraé",
    description: "Discover handcrafted fine jewelry designed for the modern woman.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <Providers>
          <Navbar />
          <CartDrawer />
          <main>{children}</main>
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: "var(--font-geist-sans)",
                borderRadius: 0,
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
