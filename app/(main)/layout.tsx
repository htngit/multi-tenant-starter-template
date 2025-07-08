import { SupabaseProvider } from '@/components/providers/supabase-provider';
import { Toaster } from "@/components/ui/sonner";
import { PerformanceMonitorWrapper } from "@/components/debug/performance-monitor-wrapper";

/**
 * Main Layout for the application
 * Contains components that use Stack Auth hooks and require Suspense boundaries
 * This layout is wrapped in a route group to ensure proper Suspense handling
 */
export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SupabaseProvider>
      {children}
      <Toaster />
      <PerformanceMonitorWrapper />
    </SupabaseProvider>
  );
}