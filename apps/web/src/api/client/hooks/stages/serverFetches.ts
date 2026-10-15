"use server";

import { serverApiUrl } from "api/serverApiUrl";
import { StageResponsesEnum } from "@tournament-app/types";
import { revalidatePath } from "next/cache";

export const fetchStage = async (stageId: number | undefined) => {
  if (!stageId) return [];

  return fetch(
    `${serverApiUrl}/stages/${stageId}?responseType=${StageResponsesEnum.WITH_EXTENDED_TOURNAMENT}`,
    {
      headers: { "Content-Type": "application/json" },
    },
  ).then((res) =>
    res.json().then((res) => {
      return res;
    }),
  );
};

export const fetchStageWithChallonge = async (stageId: number | undefined) => {
  if (!stageId) return [];

  return fetch(
    `${serverApiUrl}/stages/${stageId}?responseType=${StageResponsesEnum.WITH_CHALLONGE_TOURNAMENT}`,
    {
      headers: { "Content-Type": "application/json" },
    },
  ).then((res) =>
    res.json().then((res) => {
      return res;
    }),
  );
};

export const invalidateStages = async () => {
  revalidatePath("/stage");
  revalidatePath("/stages");
  revalidatePath("/manageStages");
};
