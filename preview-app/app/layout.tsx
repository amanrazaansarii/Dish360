import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Dish360 — Immersive AR Menus for Premium Restaurants",
  description:
    "Replace flat PDF menus with frictionless WebAR experiences. Dish360 brings your dishes to life with photorealistic 3D models — no app download required.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#16191C] text-[#F5F5ED]">
        {children}
      </body>
    </html>
  );
}
