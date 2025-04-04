"use client";

import { useQuery } from "@tanstack/react-query";
import { IQuizResponse, QuizResponsesEnum } from "@tournament-app/types";
import {
  clientApi,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";

export const getQuiz = async (
  id: number,
  responseType: QuizResponsesEnum = QuizResponsesEnum.BASE,
) => {
  return clientApi
    .get<
      never,
      AxiosResponse<IQuizResponse>
    >(`/quiz/${id}?responseType=${responseType}`)
    .then((res) => res.data);
};

export const useQuiz = (
  id: number | undefined,
  responseType: QuizResponsesEnum = QuizResponsesEnum.BASE,
) => {
  return useQuery({
    queryKey: ["quiz", id, responseType],
    queryFn: () => getQuiz(id!, responseType),
    staleTime: 60000, // 1 minute
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    enabled: id !== undefined && id !== null,
  });
};
