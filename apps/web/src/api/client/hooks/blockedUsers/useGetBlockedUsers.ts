"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  IBaseQueryResponse,
  IMiniUserResponseWithProfilePicture,
} from "@tournament-app/types";
import { clientApi } from "api/client/base";
import { pagedQueryOptions } from "api/client/queryOptions";
import { AxiosResponse } from "axios";

export const getBlockedUsers = async (page: number, groupId?: number) =>
  clientApi
    .get<
      never,
      AxiosResponse<IBaseQueryResponse<IMiniUserResponseWithProfilePicture>>
    >(`/blocked-users/${groupId}`, { params: { pageSize: 10, page } })
    .then((res) => res.data);

export const useGetBlockedUsers = (groupId?: number) => {
  return useInfiniteQuery({
    queryKey: ["blocked-users", groupId],
    queryFn: ({ pageParam = 1 }: { pageParam?: number }) =>
      getBlockedUsers(pageParam, groupId),
    ...pagedQueryOptions("medium"),
  });
};
