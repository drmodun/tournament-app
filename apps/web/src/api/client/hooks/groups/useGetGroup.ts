"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  GroupResponsesEnum,
  IExtendedUserResponse,
} from "@tournament-app/types";
import { clientApi, getAccessToken } from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";

export const getGroup = async (groupId: number) =>
  clientApi
    .get<never, AxiosResponse>(`/groups/${groupId}`, {
      params: {
        responseType: GroupResponsesEnum.EXTENDED,
      },
    })
    .then((res) => res.data);

export const useGetGroup = () => {
  const toast = useToastContext();

  return useMutation({
    mutationKey: ["me"],
    mutationFn: getGroup,
    retryDelay: 10000,
    onError: (error: any) => {
      toast.addToast(
        "an error occurred while fetching the data of a group..",
        "error",
      );
      console.error(error);
    },
  });
};
