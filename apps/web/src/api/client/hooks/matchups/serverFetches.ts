"use server";

import { revalidatePath } from "next/cache";

export const fetchMatchup = async (matchupId: number | undefined) => {
  return fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500"}/matches/matchup/${matchupId}/results`,
    {
      headers: { "Content-Type": "application/json" },
    }
  ).then((res) =>
    res.json().then((res) => {
      console.log(res);
      return res;
    })
  );
};

export const invalidateMatchups = () => {
  revalidatePath("/manageMatchup");
  revalidatePath("/match");
  revalidatePath("/manageUserManagedMatchups");
};
