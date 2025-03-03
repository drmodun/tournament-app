"use server";

import { TournamentResponsesEnum } from "@tournament-app/types";

export const fetchCompetition = async (competitionId: number | undefined) =>
  fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500"}/tournaments/${competitionId}?responseType=${TournamentResponsesEnum.EXTENDED}`,
    {
      headers: { "Content-Type": "application/json" },
    },
  ).then((res) =>
    res.json().then((res) => {
      console.log("RES", res);
      return res;
    }),
  );
