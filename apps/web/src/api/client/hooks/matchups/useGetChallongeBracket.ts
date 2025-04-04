"use client";

import { useQuery } from "@tanstack/react-query";
import {
  IExtendedRosterResponse,
  RosterResponsesEnum,
} from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  SMALL_QUERY_RETRY_ATTEMPTS,
  SMALL_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";

export const getChallongeBracket = async (stageId?: number) =>
  clientApi
    .get<never, AxiosResponse>(`/matches/stage/${stageId}/bracket/challonge`)
    .then((res) => res.data);

export const useGetChallongeBracket = (stageId?: number) => {
  return useQuery({
    queryKey: ["matchup", stageId ?? ""],
    queryFn: () => getChallongeBracket(stageId),
    staleTime: Infinity,
    retryDelay: SMALL_QUERY_RETRY_DELAY,
    retry: SMALL_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
  });
};
