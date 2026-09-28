import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import AssistantChat from "@/components/AssistantChat";
import InteractiveBackground from "@/components/InteractiveBackground";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Anargic - Servidor de Minecraft",
  description: "La mejor experiencia de Minecraft 1.17.1. Únete a nuestra comunidad, explora la tienda, perfiles y más.",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};


export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <InteractiveBackground />
        <Navbar />
        <main>{children}</main>
        <AssistantChat />
      </body>
    </html>
  );
}
