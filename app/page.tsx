import BackgroundPaths from "@/components/background-paths"

// Force dynamic rendering to prevent build-time errors
export const dynamic = 'force-dynamic';

export default function SplashPage() {
  return <BackgroundPaths title="XalesIn ERP" />
}