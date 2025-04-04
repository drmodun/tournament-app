"use client";

import { useQuery } from "@tanstack/react-query";
import { IQuizResponse, QuizResponsesEnum } from "@tournament-app/types";
import {
  clientApi,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";
import { useSearchParams } from "next/navigation";

export interface QuizQueryParams {
  page?: number;
  pageSize?: number;
  name?: string;
  authorId?: number;
  matchupId?: number;
  stageId?: number;
  isTest?: boolean;
  responseType?: QuizResponsesEnum;
}

interface QuizzesResponse {
  results: IQuizResponse[];
  metadata: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export const getQuizzes = async (params?: QuizQueryParams) => {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.pageSize)
    searchParams.append("pageSize", params.pageSize.toString());
  if (params?.name) searchParams.append("name", params.name);
  if (params?.authorId)
    searchParams.append("authorId", params.authorId.toString());
  if (params?.matchupId)
    searchParams.append("matchupId", params.matchupId.toString());
  if (params?.stageId)
    searchParams.append("stageId", params.stageId.toString());
  if (params?.isTest !== undefined)
    searchParams.append("isTest", params.isTest.toString());
  if (params?.responseType)
    searchParams.append("responseType", params.responseType);

  const queryString = searchParams.toString();
  const url = `/quiz${queryString ? `?${queryString}` : ""}`;

  return clientApi
    .get<never, AxiosResponse<QuizzesResponse>>(url)
    .then((res) => res.data);
};

export const useQuizzes = (params?: QuizQueryParams) => {
  const searchParams = useSearchParams();
  const page = params?.page || Number(searchParams.get("page")) || 1;
  const pageSize =
    params?.pageSize || Number(searchParams.get("pageSize")) || 12;

  return useQuery({
    queryKey: ["quizzes", { ...params, page, pageSize }],
    queryFn: () => getQuizzes({ ...params, page, pageSize }),
    staleTime: 60000, // 1 minute
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
  });
};
