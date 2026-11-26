import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "REELROOM — Your screen, your stories",
    template: "%s · REELROOM",
  },
  description:
    "A reference streaming experience: profiles, curated rows, continue watching and parental controls.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ink text-cream antialiased">{children}</body>
    </html>
  );
}
