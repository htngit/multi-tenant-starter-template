'use client';

import { useTheme } from "next-themes";
import { Logo } from "./logo";

export default function HandlerHeader() {
  // TODO: Replace Stack Auth user logic with Supabase
  const { theme, setTheme } = useTheme();

  return (
    <>
      <header className="fixed w-full z-50 p-4 h-14 flex items-center py-4 border-b justify-between bg-background">
        {/* TODO: Update Logo link based on Supabase auth status */}
        <Logo link="/"/>

        <div className="flex items-center justify-end gap-5">
          {/* TODO: Replace UserButton with Supabase auth component */}
          <div>User Button Placeholder</div>
        </div>
      </header>
      <div className="min-h-14"/> {/* Placeholder for fixed header */}
    </>
  );
}