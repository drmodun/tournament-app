"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  GroupResponsesEnum,
  IExtendedUserResponse,
  IGroupResponseExtended,
  IMiniGroupResponseWithLogo,
} from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
  SMALL_QUERY_RETRY_ATTEMPTS,
  SMALL_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";

export const getContestParticipatingGroups = async (tournamentId?: number) =>
  clientApi
    .get<
      never,
      AxiosResponse<IMiniGroupResponseWithLogo[]>
    >(`/groups/for-roster/${tournamentId}`)
    .then((res) => res.data);

export const useGetContestParticipatingGroups = (tournamentId?: number) => {
  return useQuery({
    queryKey: ["group", tournamentId ?? "", "participation"],
    queryFn: () => getContestParticipatingGroups(tournamentId),
    staleTime: Infinity,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
  });
};
