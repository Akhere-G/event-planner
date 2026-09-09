import type { Metadata } from "next";
import "./global.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://triptrack.uk"),

  title: {
    default: "TripTrack | Travel Planning Made Simple",
    template: "%s | TripTrack",
  },

  description:
    "TripTrack is an AI-powered travel planner that helps you plan trips, build itineraries, discover activities, organise accommodation and travel together.",

  keywords: [
    "travel planner",
    "trip planner",
    "itinerary planner",
    "AI travel planner",
    "travel planning app",
    "trip itinerary",
    "holiday planner",
    "vacation planner",
  ],

  authors: [{ name: "TripTrack" }],
  creator: "TripTrack",
  publisher: "TripTrack",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://triptrack.uk",
    siteName: "TripTrack",
    title: "TripTrack | Travel Planning Made Simple",
    description:
      "Plan trips, build itineraries, discover places and travel together with TripTrack's AI-powered travel planner.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TripTrack travel planner",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "TripTrack | Travel Planning Made Simple",
    description:
      "Plan trips, build itineraries and travel together with TripTrack.",
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GB" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
