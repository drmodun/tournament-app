"use server";

import { RosterResponsesEnum } from "@tournament-app/types";

export const fetchRosters = async (stageId?: number, page?: number) => {
  return fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500"}/roster/stage/${stageId}?responseType=${RosterResponsesEnum.EXTENDED}&page=${page ?? 1}&pageSize=10`,
    {
      headers: { "Content-Type": "application/json" },
    },
  ).then((res) =>
    res.json().then((res) => {
      console.log(res);
      return res;
    }),
  );
};
