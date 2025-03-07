"use client";

import { useQuery } from "@tanstack/react-query";
import { ILFGResponse } from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";

export const getLFGTeam = async (groupId?: number) =>
  clientApi
    .get<
      never,
      AxiosResponse<ILFGResponse[]>
    >(`/lfg/${groupId}`, { params: { groupId } })
    .then((res) => res.data);

export const useGetLFGTeam = (groupId?: number) => {
  return useQuery({
    queryKey: ["me", "lfg", groupId ?? ""],
    queryFn: () => getLFGTeam(groupId),
    staleTime: Infinity,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
  });
};
