"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { IBaseQueryResponse } from "@tournament-app/types";
import { clientApi } from "api/client/base";
import { pagedQueryOptions } from "api/client/queryOptions";
import { AxiosResponse } from "axios";

export type Interest = {
  id: number;
  name: string;
  image: string;
  type: string;
  description: string;
};

export const getGroupInterests = async (groupId?: number, page?: number) => {
  console.log(groupId, page, "aaaa");
  return clientApi
    .get<never, AxiosResponse<IBaseQueryResponse<Interest>>>(
      `/group-interests/${groupId}`,
      { params: { pageSize: 10, page: page } },
    )
    .then((res) => res.data);
};

export const useGetGroupInterests = (groupId?: number) => {
  return useInfiniteQuery({
    queryKey: ["interest", groupId],
    queryFn: ({ pageParam }: { pageParam?: number }) =>
      getGroupInterests(groupId, pageParam),
    ...pagedQueryOptions("medium"),
  });
};
