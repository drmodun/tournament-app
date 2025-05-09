"use server";

import { revalidatePath } from "next/cache";

export const fetchQuiz = async (id: number | undefined) => {
  if (!id) return undefined;

  return fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500"}/quiz/detailed/${id}`,
    {
      headers: { "Content-Type": "application/json" },
    },
  ).then((res) =>
    res.json().then((res) => {
      return res;
    }),
  );
};

export const invalidateQuizzes = () => {
  revalidatePath("/quiz");
  revalidatePath("/manageQuizzes");
};
