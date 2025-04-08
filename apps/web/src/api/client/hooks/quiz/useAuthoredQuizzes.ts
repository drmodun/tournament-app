"use client";

import { useQuery } from "@tanstack/react-query";
import { IQuizResponse } from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";
import { useSearchParams } from "next/navigation";

interface AuthoredQuizzesParams {
  page?: number;
  pageSize?: number;
}

export const getAuthoredQuizzes = async (params?: AuthoredQuizzesParams) => {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.pageSize)
    searchParams.append("pageSize", params.pageSize.toString());

  const queryString = searchParams.toString();
  const url = `/quiz/authored${queryString ? `?${queryString}` : ""}`;

  return clientApi
    .get<never, AxiosResponse<IQuizResponse[]>>(url)
    .then((res) => res.data);
};

export const useAuthoredQuizzes = (params?: AuthoredQuizzesParams) => {
  const searchParams = useSearchParams();
  const page = params?.page || Number(searchParams.get("page")) || 1;
  const pageSize =
    params?.pageSize || Number(searchParams.get("pageSize")) || 12;

  return useQuery({
    queryKey: ["authored-quizzes", { page, pageSize }],
    queryFn: () => getAuthoredQuizzes({ page, pageSize }),
    staleTime: 60000, // 1 minute
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    enabled: !!getAccessToken(),
  });
};
