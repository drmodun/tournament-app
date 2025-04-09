"use server";

import { StageResponsesEnum } from "@tournament-app/types";
import { revalidatePath } from "next/cache";

export const fetchStage = async (stageId: number | undefined) => {
  if (!stageId) return [];

  return fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500"}/stages/${stageId}?responseType=${StageResponsesEnum.WITH_EXTENDED_TOURNAMENT}`,
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
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500"}/stages/${stageId}?responseType=${StageResponsesEnum.WITH_CHALLONGE_TOURNAMENT}`,
    {
      headers: { "Content-Type": "application/json" },
    },
  ).then((res) =>
    res.json().then((res) => {
      return res;
    }),
  );
};

export const invalidateStages = () => {
  revalidatePath("/stage");
  revalidatePath("/stages");
  revalidatePath("/manageStages");
};
