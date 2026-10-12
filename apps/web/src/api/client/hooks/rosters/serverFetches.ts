"use server";

import { serverApiUrl } from "api/serverApiUrl";
import { RosterResponsesEnum } from "@tournament-app/types";
import { revalidatePath } from "next/cache";

export const fetchRosters = async (stageId?: number, page?: number) => {
  return fetch(
    `${serverApiUrl}/roster/stage/${stageId}?responseType=${RosterResponsesEnum.EXTENDED}&page=${page ?? 1}&pageSize=10`,
    {
      headers: { "Content-Type": "application/json" },
    }
  ).then((res) =>
    res.json().then((res) => {
      return res;
    })
  );
};

export const invalidateRosters = async () => {
  revalidatePath("/stage");
  revalidatePath("/stages");
  revalidatePath("/manageStages");
  revalidatePath("/userManagedMatchups");
  revalidatePath("/manageMatchup");
  revalidatePath("/manageRosters");
};
