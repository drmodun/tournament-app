"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  GroupResponsesEnum,
  IExtendedUserResponse,
  IGroupResponseExtended,
} from "@tournament-app/types";
import { clientApi, getAccessToken } from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";

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
    queryKey: ["group", "me"],
    queryFn: () => getGroup(groupId),
    staleTime: Infinity,
    retryDelay: 10000,
    enabled: getAccessToken() !== null,
  });
};
