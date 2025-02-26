"use server";

import { UserResponsesEnum } from "@tournament-app/types";

export const fetchUser = async (userId: number) =>
  fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500"}/users/${userId}?responseType=${UserResponsesEnum.EXTENDED}`,
    {
      headers: { "Content-Type": "application/json" },
    },
  ).then((res) => res.json().then((res) => res));
