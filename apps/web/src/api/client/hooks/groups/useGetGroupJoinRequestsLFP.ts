"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  IBaseQueryResponse,
  IGroupJoinRequestQuery,
  IGroupJoinRequestWithMiniUserResponse,
} from "@tournament-app/types";
import { clientApi } from "api/client/base";
import { pagedQueryOptions } from "api/client/queryOptions";
import { AxiosResponse } from "axios";

export const getGroupJoinRequestsLFP = async (
  page: number | undefined,

  data?: IGroupJoinRequestQuery,
) =>
  clientApi
    .get<
      IGroupJoinRequestQuery,
      AxiosResponse<IBaseQueryResponse<IGroupJoinRequestWithMiniUserResponse>>
    >(`/group-join-requests`, {
      params: {
        ...data,
        page: page ?? 1,
        pageSize: 10,
      },
    })
    .then((res) => res.data);

export const useGroupJoinRequestsLFP = (data?: IGroupJoinRequestQuery) => {
  return useInfiniteQuery({
    queryKey: ["group", data],
    queryFn: ({ pageParam }: { pageParam?: number }) =>
      getGroupJoinRequestsLFP(pageParam, data),
    ...pagedQueryOptions("medium"),
  });
};
