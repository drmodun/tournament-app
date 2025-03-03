"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  FollowerResponsesEnum,
  GroupJoinRequestResponsesEnum,
  IBaseQueryResponse,
  IFollowerMiniResponse,
  IFollowerResponse,
  IGroupJoinRequestWithUserResponse,
  ILocationResponse,
  LocationResponsesEnum,
} from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { useAuth } from "../auth/useAuth";
import { AxiosResponse } from "axios";

export const getManagedForPlayer = async (tournamentId?: number) =>
  clientApi
    .get<
      never,
      AxiosResponse
    >(`/participations/managed-for-player/${tournamentId}`)
    .then((res) => res.data);

export const useGetManagedForPlayer = (tournamentId?: number) => {
  return useQuery({
    queryKey: ["competition", "me", tournamentId],
    queryFn: () => getManagedForPlayer(tournamentId),
    staleTime: Infinity,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
  });
};
