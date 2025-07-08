import type { Metadata } from 'next';
import { Inter } from "next/font/google";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "../stack";
import "./globals.css";
import { Provider } from "./provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Stack Template",
  description: "A Multi-tenant Next.js Starter Template",
};

/**
 * Root Layout - Contains only essential providers that don't require Suspense boundaries
 * Components that use Stack Auth hooks are moved to the (main) layout
 */
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
            </Provider>
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
