"use server";

import { StageResponsesEnum } from "@tournament-app/types";

export const fetchStage = async (stageId: number | undefined) => {
  return fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500"}/stages/${stageId}?responseType=${StageResponsesEnum.WITH_EXTENDED_TOURNAMENT}`,
    {
      headers: { "Content-Type": "application/json" },
    },
  ).then((res) => res.json().then((res) => res));
};
