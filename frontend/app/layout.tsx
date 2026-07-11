import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://aruu.app"),
  title: "Aruu | Backend Systems Engineer",
  description:
    "Backend engineer portfolio featuring Go APIs, PostgreSQL, middleware, deployment contracts, and realtime WebSocket demos.",
  openGraph: {
    title: "Aruu | Backend Systems Engineer",
    description:
      "A backend-first portfolio built around live API surfaces, Go services, PostgreSQL, and deployment proof.",
    url: "https://aruu.app",
    siteName: "Aruu Backend Systems",
    images: [
      {
        url: "/showcase-playground.png",
        width: 1400,
        height: 920,
        alt: "Aruu backend portfolio API playground",
      },
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
