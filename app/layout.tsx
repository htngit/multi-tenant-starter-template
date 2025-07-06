import type { Metadata } from 'next';
import { Inter } from "next/font/google";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "../stack";
import "./globals.css";
import { Provider } from "./provider";
import { Toaster } from "@/components/ui/sonner";
import { PerformanceMonitorWrapper } from "@/components/debug/performance-monitor-wrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Stack Template",
  description: "A Multi-tenant Next.js Starter Template",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <StackProvider app={stackServerApp}>
          <StackTheme>
            <Provider>
              {children}
              <Toaster />
              <PerformanceMonitorWrapper />
            </Provider>
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
