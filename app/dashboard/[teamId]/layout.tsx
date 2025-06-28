'use client';

import { NewLayout } from "@/components/new-layout";
import { SelectedTeamSwitcher, useUser } from "@stackframe/stack";
import { useParams, useRouter } from "next/navigation";

export default function Layout(props: { children: React.ReactNode }) {
  const params = useParams<{ teamId: string }>();
  const user = useUser({ or: 'redirect' });
  const team = user.useTeam(params.teamId);
  const router = useRouter();

  if (!team) {
    router.push('/dashboard');
    return null;
  }

  return (
    <NewLayout 
      teamId={team.id}
      teamName={team.displayName}
    >
      {props.children}
    </NewLayout>
  );
}