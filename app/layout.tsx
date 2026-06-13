import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mana | Wellness Companion",
  description: "An empathetic AI wellness tracker for high-stakes exam students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0A0C10] text-indigo-50 flex h-screen overflow-hidden`}>
        {/* Persistent Sidebar Navigation */}
        <Sidebar />
        
        {/* Main Content Area - Pushed to the right by the width of the sidebar (w-64 = 16rem = 256px) */}
        <main className="flex-1 ml-64 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}