import { Metadata } from "next";

// Force dynamic rendering to prevent build-time errors
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Test Page",
  description: "Test description",
};

/**
 * Test Page Component
 */
export default function TestPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <h2 className="text-3xl font-bold tracking-tight">Test Page</h2>
      <p className="text-muted-foreground">
        This is a test page
      </p>
    </div>
  );
}