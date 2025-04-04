"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateQuizDto } from "@tournament-app/types";
import { clientApi } from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";

export const createQuiz = async (data: CreateQuizDto) =>
  clientApi
    .post<never, AxiosResponse<{ id: number }>>(`/quiz`, data)
    .then((res) => res.data);

export const useCreateQuiz = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createQuiz,
    onSuccess: async (data) => {
      toast.addToast("Quiz created successfully", "success");
      await queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey.includes("quizzes") ||
          query.queryKey.includes("authored-quizzes"),
      });
      return data;
    },
    onError: (error: any) => {
      if (error.response?.status === 413) {
        toast.addToast(
          "Image too large, please select an image under 2MB",
          "error"
        );
      } else {
        toast.addToast(error.message ?? "Failed to create quiz", "error");
      }
      console.error(error);
      return false;
    },
    onMutate: () => {
      toast.addToast("Creating quiz...", "info");
    },
  });
};
