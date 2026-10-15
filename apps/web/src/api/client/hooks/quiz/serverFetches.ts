"use server";

import { serverApiUrl } from "api/serverApiUrl";
import { revalidatePath } from "next/cache";

export const fetchQuiz = async (id: number | undefined) => {
  if (!id) return undefined;

  return fetch(`${serverApiUrl}/quiz/detailed/${id}`, {
    headers: { "Content-Type": "application/json" },
  }).then((res) =>
    res.json().then((res) => {
      return res;
    }),
  );
};

export const invalidateQuizzes = async () => {
  revalidatePath("/quiz");
  revalidatePath("/manageQuizzes");
};
