import type { Metadata } from "next";

import "./global.css";

export const metadata: Metadata = {
  title: "TripTrack - Travel Planning Made Simple",
  description: "Plan your trips and collaborate with friends. AI-powered travel planning that simplifies your journey.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
