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

export const getPaginatedUserInterests = async (page?: number) =>
  clientApi
    .get<never, AxiosResponse<IBaseQueryResponse<Interest>>>(`/interest`, {
      params: { pageSize: 10, page: page },
    })
    .then((res) => res.data);

export const useGetPaginatedUserInterests = () => {
  return useInfiniteQuery({
    queryKey: ["interest"],
    queryFn: ({ pageParam }: { pageParam?: number }) =>
      getPaginatedUserInterests(pageParam),
    ...pagedQueryOptions("medium"),
  });
};
