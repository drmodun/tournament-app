"use server";

import { revalidatePath } from "next/cache";

export const fetchFormattedBracket = async (stageId: number) =>
  fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500"}/matches/stage/${stageId}/bracket/react`,
    {
      headers: { "Content-Type": "application/json" },
    }
  ).then((res) => res.json().then((res) => res));

export const invalidateMatches = () => {
  revalidatePath("/manageMatchup");
  revalidatePath("/match");
  revalidatePath("/manageUserManagedMatchups");
};
