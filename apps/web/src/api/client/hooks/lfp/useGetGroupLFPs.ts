"use client";

import { useQuery } from "@tanstack/react-query";
import { IGetLFPRequest, ILFPResponse } from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  SMALL_QUERY_RETRY_ATTEMPTS,
  SMALL_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";

export const getLFPs = async (groupId: number, query?: IGetLFPRequest) =>
  clientApi
    .get<
      never,
      AxiosResponse<ILFPResponse[]>
    >(`/lfp/${groupId}`, { params: query })
    .then((res) => res.data);

export const useGetGroupLFPs = (groupId: number, query?: IGetLFPRequest) => {
  return useQuery({
    queryKey: [groupId, query, "lfp"],
    queryFn: () => getLFPs(groupId, query),
    staleTime: Infinity,
    retryDelay: SMALL_QUERY_RETRY_DELAY,
    retry: SMALL_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
  });
};
