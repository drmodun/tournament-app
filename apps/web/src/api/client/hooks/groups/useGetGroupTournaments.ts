"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  BaseQueryType,
  BaseTournamentResponseType,
  groupRoleEnumType,
  IBaseQueryResponse,
  ICreateGroupRequest,
  IMiniGroupResponseWithCountry,
  IMiniTournamentResponse,
  IMiniTournamentResponseWithLogo,
  IMiniUserResponseWithCountry,
  TournamentResponsesEnum,
  userRoleEnumType,
} from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";
import { useEffect } from "react";
import { useToastContext } from "utils/hooks/useToastContext";

export const getGroupTournaments = async (groupId: number | undefined) =>
  clientApi
    .get<
      never,
      AxiosResponse<IBaseQueryResponse<IMiniTournamentResponseWithLogo>>
    >(`/tournaments`, { params: { affiliatedGroupId: groupId, responseType: TournamentResponsesEnum.MINI_WITH_LOGO } })
    .then((res) => res.data);

export const useGetGroupTournaments = (groupId: number | undefined) => {
  return useQuery({
    queryKey: ["group", groupId],
    queryFn: () => getGroupTournaments(groupId),
    staleTime: Infinity,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
  });
};
