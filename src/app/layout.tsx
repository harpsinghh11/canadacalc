import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CanadaCalc — Canadian Financial Calculators",
    template: "%s | CanadaCalc",
  },
  description:
    "Free Canadian personal finance calculators: TFSA, FHSA, mortgage, tax, retirement, compound and simple interest, and stock lookback tools.",
  icons: {
    icon: "/icon.svg",
  },
  verification: {
    google: "REPLACE_WITH_YOUR_VERIFICATION_CODE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
