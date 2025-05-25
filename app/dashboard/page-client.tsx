"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { useRouter } from "next/navigation";

export function PageClient() {
  const router = useRouter();
  // TODO: Replace Stack Auth user and team logic with Supabase
  // For now, redirecting to a placeholder or login if no user

  // Placeholder logic - replace with actual Supabase user/team check
  const userExists = true; // Assume user exists for now
  const teamsExist = true; // Assume teams exist for now
  const selectedTeamId = 'placeholder-team-id'; // Placeholder team ID

  if (!userExists) {
    router.push('/auth/login'); // Redirect to login if no user
    return null;
  } else if (!teamsExist) {
     return (
      <div className="flex items-center justify-center h-screen w-screen">
        <div className="max-w-xs w-full">
          <h1 className="text-center text-2xl font-semibold">Welcome!</h1>
          <p className="text-center text-gray-500">
            Create a team to get started
          </p>
          {/* TODO: Add Supabase team creation form */}
          <form
            className="mt-4"
            onSubmit={(e) => {
              e.preventDefault();
              // user.createTeam({ displayName: teamDisplayName }); // Replace with Supabase team creation
            }}
          >
            <div>
              <Label className="text-sm">Team name</Label>
              <Input
                placeholder="Team name"
                // value={teamDisplayName} // Replace with state for new team name
                // onChange={(e) => setTeamDisplayName(e.target.value)} // Replace with handler for new team name
              />
            </div>
            <Button className="mt-4 w-full">Create team</Button>
          </form>
        </div>
      </div>
    );
  } else if (selectedTeamId) {
    router.push(`/dashboard/${selectedTeamId}`); // Redirect to selected team dashboard
  }

  return null;
}
