import type { Metadata, Viewport } from "next";
import { Alfa_Slab_One, Cabin } from "next/font/google";
import "./globals.css";
import { cafe } from "@/data/cafe";

const alfa = Alfa_Slab_One({
  variable: "--font-alfa",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const cabin = Cabin({
  variable: "--font-cabin",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${cafe.fullName} — ${cafe.city}`,
    template: `%s · ${cafe.name}`,
  },
  description:
    "A Sector 9 house rebuilt around a crate of auctioned Jeanneret chairs. Single-estate coffee, all-day plates, and a room that has not been in a hurry since 2019.",
};

export const viewport: Viewport = {
  themeColor: "#1e5d59",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${alfa.variable} ${cabin.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">{children}</body>
    </html>
  );
}
