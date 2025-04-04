"use client";

import { useQuery } from "@tanstack/react-query";
import { IQuizResponse } from "@tournament-app/types";
import {
  clientApi,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";

interface AutoCompleteParams {
  search: string;
  page?: number;
  pageSize?: number;
}

export const getQuizAutoComplete = async ({
  search,
  page = 1,
  pageSize = 12,
}: AutoCompleteParams) => {
  if (!search || search.trim() === "") {
    return {
      results: [],
      metadata: { page: 1, pageSize, totalCount: 0, totalPages: 0 },
    };
  }

  return clientApi
    .get<
      never,
      AxiosResponse<IQuizResponse[]>
    >(`/quiz/auto-complete/${search}?page=${page}&pageSize=${pageSize}`)
    .then((res) => res.data);
};

export const useQuizAutoComplete = (searchTerm: string, pageSize = 12) => {
  return useQuery({
    queryKey: ["quiz-autocomplete", searchTerm, pageSize],
    queryFn: () => getQuizAutoComplete({ search: searchTerm, pageSize }),
    staleTime: 60000, // 1 minute
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    enabled: searchTerm.trim().length > 0,
  });
};
