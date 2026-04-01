import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Briefing Pro — Para los JODA",
  description: "Tu briefing de inteligencia artificial personalizado por industria. Descubre cómo la IA puede transformar tu negocio en 2026.",
  openGraph: {
    title: "AI Briefing Pro — Para los JODA",
    description: "Tu briefing de IA personalizado por industria",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <head>
        <link
          href="https://fonts.cdnfonts.com/css/typo-round-regular"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-[#2D3748]">
        {children}
      </body>
    </html>
  );
}
