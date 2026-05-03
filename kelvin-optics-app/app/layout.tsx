import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// This defines what shows up in the browser tab and search engines
export const metadata: Metadata = {
  title: "Kelvin Optics | Main Hub",
  description: "Companion dashboard and comms for the Kelvin Optics Smart Glass.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}