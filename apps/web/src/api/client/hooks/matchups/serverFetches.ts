"use server";

import { serverApiUrl } from "api/serverApiUrl";
import { revalidatePath } from "next/cache";

export const fetchMatchup = async (matchupId: number | undefined) => {
  return fetch(`${serverApiUrl}/matches/matchup/${matchupId}/results`, {
    headers: { "Content-Type": "application/json" },
  }).then((res) =>
    res.json().then((res) => {
      console.log(res);
      return res;
    }),
  );
};

export const invalidateMatchups = async () => {
  revalidatePath("/manageMatchup");
  revalidatePath("/match");
  revalidatePath("/manageUserManagedMatchups");
};
