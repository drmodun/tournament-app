"use server";

import { serverApiUrl } from "api/serverApiUrl";
import { GroupResponsesEnum } from "@tournament-app/types";
import { revalidatePath } from "next/cache";

export const fetchGroup = async (groupId: number | undefined) => {
  return fetch(
    `${serverApiUrl}/groups/${groupId}?responseType=${GroupResponsesEnum.EXTENDED}`,
    {
      headers: { "Content-Type": "application/json" },
    }
  ).then((res) => res.json().then((res) => res));
};

export const invalidateGroups = async () => {
  revalidatePath("/lfp");
  revalidatePath("/manageTeams");
  revalidatePath("/group");
  revalidatePath("/manageGroupInterests");
  revalidatePath("/manageGroupInvites");
};
