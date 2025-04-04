"use client";

import { useQuery } from "@tanstack/react-query";
import { IQuizResponseExtended } from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";

export const getDetailedQuiz = async (id: number) => {
  return clientApi
    .get<never, AxiosResponse<IQuizResponseExtended>>(`/quiz/detailed/${id}`)
    .then((res) => res.data);
};

export const useDetailedQuiz = (id: number | undefined) => {
  return useQuery({
    queryKey: ["detailed-quiz", id],
    queryFn: () => getDetailedQuiz(id!),
    staleTime: 60000, // 1 minute
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    enabled: id !== undefined && id !== null && !!getAccessToken(),
  });
};
