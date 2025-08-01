import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/nav-bar"; // Assuming you have a NavBar component
import { WebSocketProvider } from "@/components/websocket-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Drone Management Dashboard",
  description: "Dashboard for managing and controlling drones",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WebSocketProvider>
          <div className="min-h-screen flex flex-col">
            {/* Navbar / Sidebar */}
            <NavBar />
            {/* Main content area with consistent background */}
            <main className="flex-1 bg-uniform-dark-navy-blue">{children}</main>
          </div>
        </WebSocketProvider>
      </body>
    </html>
  );
}
