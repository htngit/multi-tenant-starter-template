import { StackHandler } from "@stackframe/stack";
import { stackServerApp } from "@/stack";

// Force dynamic rendering to prevent build-time errors with Stack Auth
export const dynamic = 'force-dynamic';

export default function Handler(props: unknown) {
  return <StackHandler fullPage app={stackServerApp} routeProps={props} />;
}
