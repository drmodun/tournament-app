"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  GroupResponsesEnum,
  IExtendedUserResponse,
  IGetLFPRequest,
  IGroupResponseExtended,
  ILFPResponse,
} from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  SMALL_QUERY_RETRY_ATTEMPTS,
  SMALL_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";

export const getLFPs = async (groupId: number, query?: IGetLFPRequest) =>
  clientApi
    .get<
      never,
      AxiosResponse<ILFPResponse[]>
    >(`/lfp/${groupId}`, { params: query })
    .then((res) => res.data);

export const useGetLFPs = (groupId: number, query?: IGetLFPRequest) => {
  return useQuery({
    queryKey: [groupId, query, "lfp"],
    queryFn: () => getLFPs(groupId, query),
    staleTime: Infinity,
    retryDelay: SMALL_QUERY_RETRY_DELAY,
    retry: SMALL_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
  });
};
