"use client";

import { useQuery } from "@tanstack/react-query";
import {
  GroupResponsesEnum,
  IGroupResponseExtended,
} from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  SMALL_QUERY_RETRY_ATTEMPTS,
  SMALL_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";

export const getGroup = async (groupId: number) =>
  clientApi
    .get<never, AxiosResponse<IGroupResponseExtended>>(`/groups/${groupId}`, {
      params: {
        responseType: GroupResponsesEnum.EXTENDED,
      },
    })
    .then((res) => res.data);

export const useGetGroup = (groupId: number) => {
  return useQuery({
    queryKey: ["group", groupId ?? ""],
    queryFn: () => getGroup(groupId),
    staleTime: Infinity,
    retryDelay: SMALL_QUERY_RETRY_DELAY,
    retry: SMALL_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
  });
};
