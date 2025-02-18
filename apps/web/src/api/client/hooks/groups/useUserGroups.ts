"use client";

import { useQuery } from "@tanstack/react-query";
import {
  GroupMembershipResponsesEnum,
  IBaseQueryResponse,
  IExtendedUserResponse,
  IGroupMembershipResponse,
  IGroupMembershipResponseWithDates,
} from "@tournament-app/types";
import { clientApi, getAccessToken } from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";
import { useAuth } from "api/client/hooks/auth/useAuth";

export const getUserGroups = async (userId: number | undefined) =>
  clientApi
    .get<never, AxiosResponse<IBaseQueryResponse<IGroupMembershipResponse>>>(
      `/group-membership`,
      {
        params: {
          responseType: GroupMembershipResponsesEnum.BASE,
          userId: userId,
        },
      },
    )
    .then((res) => {
      console.log("DATA", res.data);
      return res.data;
    });

export const useUserGroups = () => {
  const { data } = useAuth();
  return useQuery({
    queryKey: ["group", "me", data?.id],
    queryFn: () => getUserGroups(data?.id),
    staleTime: Infinity,
    retryDelay: 10000,
    enabled: getAccessToken() !== null,
  });
};
