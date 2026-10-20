"use server";

import { IMatchupResponseWithResults } from "@tournament-app/types";
import { serverApiUrl } from "api/serverApiUrl";
import { revalidatePath } from "next/cache";

// Every matchup of a stage with its rosters and winners; 100 is the API's page limit,
// enough for a bracket of 64 rosters
export const fetchStageResults = async (
  stageId: number,
): Promise<IMatchupResponseWithResults[]> =>
  fetch(`${serverApiUrl}/matches/results?stageId=${stageId}&pageSize=100`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  }).then((res) => (res.ok ? res.json() : []));

export const invalidateMatches = async () => {
  revalidatePath("/manageMatchup");
  revalidatePath("/match");
  revalidatePath("/manageUserManagedMatchups");
};
