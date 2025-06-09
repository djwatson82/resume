import { GameProvider } from "@/context/GameContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Clicker Game",
  description: "A modern, feature-rich clicker game",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GameProvider>
          <main className="min-h-screen p-4">{children}</main>
        </GameProvider>
      </body>
    </html>
  );
}
