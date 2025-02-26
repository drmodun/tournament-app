"use server";

import { GroupResponsesEnum } from "@tournament-app/types";

export const fetchGroup = async (groupId: number | undefined) => {
  return fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500"}/groups/${groupId}?responseType=${GroupResponsesEnum.EXTENDED}`,
    {
      headers: { "Content-Type": "application/json" },
    },
  ).then((res) => res.json().then((res) => res));
};
