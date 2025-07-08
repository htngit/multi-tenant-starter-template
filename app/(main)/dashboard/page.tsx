import { PageClient } from "./page-client";

// Force dynamic rendering to prevent build-time errors with Stack Auth
export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Dashboard - Stack Template",
};

export default function Dashboard() {
  return <PageClient />;
}
