import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import { Toaster } from "sonner";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/store/cart-drawer";
import { Providers } from "./providers";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Zohraé — Tiny Treasures for Little Ones",
    template: "%s | Zohraé",
  },
  description:
    "Kids' jewelry made for little ones: magnetic clip-on earrings, bead bracelets and necklaces, hair accessories and rings. Cash on delivery across Pakistan.",
  keywords: [
    "kids jewelry",
    "magnetic earrings for kids",
    "bead bracelets",
    "bead necklaces",
    "hair accessories",
    "girls jewelry Pakistan",
  ],
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Zohraé",
    title: "Zohraé — Tiny Treasures for Little Ones",
    description: "Magnetic earrings, bead jewelry and more for kids. Cash on delivery across Pakistan.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zohraé",
    description: "Magnetic earrings, bead jewelry and more for kids.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fredoka.variable} ${nunito.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: "var(--font-nunito)",
                borderRadius: 16,
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
