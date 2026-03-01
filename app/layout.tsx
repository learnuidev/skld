import "@/lib/amplify/client-init";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ReactQueryProvider } from "@/components/react-query/react-query-provider";

import "./globals.css";
import { NavBar } from "@/components/nav-bar";
import { Suspense } from "react";
import { WithAuthenticated } from "@/components/auth/with-authenticated";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "skld",
  description: "exam simulator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReactQueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <WithAuthenticated>
              <div className="w-full  md:max-w-7xl mx-auto px-4 md:px-16">
                <NavBar />
                <Suspense fallback={<div></div>}>{children}</Suspense>
              </div>
            </WithAuthenticated>
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
