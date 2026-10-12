"use server";

import { serverApiUrl } from "api/serverApiUrl";
import { UserResponsesEnum } from "@tournament-app/types";
import { revalidatePath } from "next/cache";

export const fetchUser = async (userId: number) =>
  fetch(
    `${serverApiUrl}/users/${userId}?responseType=${UserResponsesEnum.EXTENDED}`,
    {
      headers: { "Content-Type": "application/json" },
    }
  ).then((res) => res.json().then((res) => res));

export const invalidateUser = async () => {
  revalidatePath("/user");
  revalidatePath("/userManagedMatchups");
  revalidatePath("/manageUserManagedMatchups");
  revalidatePath("/manageUserManagedQuizzes");
};
