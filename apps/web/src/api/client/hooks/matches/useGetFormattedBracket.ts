"use client";

import { useQuery } from "@tanstack/react-query";
import {
  clientApi,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";

export const getFormattedBracket = async (stageId?: number) =>
  clientApi
    .get<never, AxiosResponse>(`/matches/stage/${stageId}/bracket/react`, {
      params: {
        stageId,
      },
    })
    .then((res) => res.data);

export const useGetFormattedBracket = (stageId?: number) => {
  return useQuery({
    queryKey: ["match", stageId],
    queryFn: () => getFormattedBracket(stageId),
    staleTime: Infinity,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
  });
};
