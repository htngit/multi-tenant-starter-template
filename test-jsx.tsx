import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Test Page",
  description: "Test description",
};

export default function TestPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Test Page</h2>
          <p className="text-muted-foreground">
            This is a test page
          </p>
        </div>
      </div>
    </div>
  );
}