import type { Metadata, Viewport } from "next";
import { Jost, Marcellus } from "next/font/google";
import "./globals.css";
import { cafe } from "@/data/cafe";
import { MotionProvider } from "@/components/Motion";

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
    default: `${cafe.fullName}, ${cafe.city}`,
    template: `%s · ${cafe.name}`,
  },
  description:
    "Pizza, pasta, Chinese and coffee on the first floor in Sector 35C, Chandigarh. Open every day, 11am to 11pm.",
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
      <head>
        {/*
          Scroll reveals start at opacity 0 and are brought up by JavaScript.
          With scripts off that would leave a reader looking at blank sections.
          A <noscript> rule is parsed only in that case, so nobody else pays a
          flash for it.
        */}
        <noscript>
          <style>{"[data-reveal]{opacity:1!important;transform:none!important}"}</style>
        </noscript>
      </head>
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
