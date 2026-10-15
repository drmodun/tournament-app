"use server";

import { serverApiUrl } from "api/serverApiUrl";
import { revalidatePath } from "next/cache";

export const fetchFormattedBracket = async (stageId: number) =>
  fetch(`${serverApiUrl}/matches/stage/${stageId}/bracket/react`, {
    headers: { "Content-Type": "application/json" },
  }).then((res) => res.json().then((res) => res));

export const invalidateMatches = async () => {
  revalidatePath("/manageMatchup");
  revalidatePath("/match");
  revalidatePath("/manageUserManagedMatchups");
};
