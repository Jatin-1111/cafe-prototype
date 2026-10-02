import type { Metadata, Viewport } from "next";
import { Jost, Marcellus } from "next/font/google";
import "./globals.css";
import { cafe } from "@/data/cafe";

// Echoes the thin, wide-tracked letters backlit on the counter wall.
const marcellus = Marcellus({
  variable: "--font-marcellus",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${cafe.fullName} — ${cafe.city}`,
    template: `%s · ${cafe.name}`,
  },
  description:
    "Tasteful food, chilled drinks and vibes that calm the mind — a cosy corner for every craving, on the first floor in Sector 35C, Chandigarh.",
};

export const viewport: Viewport = {
  themeColor: "#bc5228",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${marcellus.variable} ${jost.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">{children}</body>
    </html>
  );
}
