"use server";

import { TournamentResponsesEnum } from "@tournament-app/types";
import { revalidatePath } from "next/cache";

export const fetchCompetition = async (competitionId: number | undefined) =>
  fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500"}/tournaments/${competitionId}?responseType=${TournamentResponsesEnum.EXTENDED}`,
    {
      headers: { "Content-Type": "application/json" },
    }
  ).then((res) =>
    res.json().then((res) => {
      return res;
    })
  );

export const invalidateCompetitions = () => {
  revalidatePath("/contest");
  revalidatePath("/manageCompetitions");
  revalidatePath("/stage");
  revalidatePath("/stages");
  revalidatePath("/manageStages");
};
