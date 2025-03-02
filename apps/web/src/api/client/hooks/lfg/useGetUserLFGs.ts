"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  GroupResponsesEnum,
  IExtendedUserResponse,
  IGroupResponseExtended,
  ILFGResponse,
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

export const getUserLFGs = async () =>
  clientApi
    .get<
      never,
      AxiosResponse<ILFGResponse[]>
    >(`/lfg/me`, { params: { pageSize: 20, page: 1 } })
    .then((res) => {
      return res.data;
    });

export const useGetUserLFGs = () => {
  return useQuery({
    queryKey: ["me", "lfg"],
    queryFn: getUserLFGs,
    staleTime: Infinity,
    retryDelay: SMALL_QUERY_RETRY_DELAY,
    retry: SMALL_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
  });
};
