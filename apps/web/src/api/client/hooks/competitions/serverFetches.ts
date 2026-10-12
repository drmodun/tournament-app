"use server";

import { serverApiUrl } from "api/serverApiUrl";
import { TournamentResponsesEnum } from "@tournament-app/types";
import { revalidatePath } from "next/cache";

export const fetchCompetition = async (competitionId: number | undefined) =>
  fetch(
    `${serverApiUrl}/tournaments/${competitionId}?responseType=${TournamentResponsesEnum.EXTENDED}`,
    {
      headers: { "Content-Type": "application/json" },
    }
  ).then((res) =>
    res.json().then((res) => {
      return res;
    })
  );

export const invalidateCompetitions = async () => {
  revalidatePath("/contest");
  revalidatePath("/manageCompetitions");
  revalidatePath("/stage");
  revalidatePath("/stages");
  revalidatePath("/manageStages");
};
