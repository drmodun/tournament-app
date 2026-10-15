"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  IBaseQueryResponse,
  IExtendedRosterResponse,
  RosterResponsesEnum,
} from "@tournament-app/types";
import { clientApi } from "api/client/base";
import { pagedQueryOptions } from "api/client/queryOptions";
import { AxiosResponse } from "axios";

export const getParticipationRosters = async (
  page: number,
  participationId?: number,
) =>
  clientApi
    .get<never, AxiosResponse<IBaseQueryResponse<IExtendedRosterResponse>>>(
      `/roster/participation/${participationId}`,
      {
        params: {
          responseType: RosterResponsesEnum.EXTENDED,
          page: page,
          pageSize: 10,
        },
      },
    )
    .then((res) => res.data);

export const useGetParticipationRosters = (participationId?: number) => {
  return useInfiniteQuery({
    queryKey: ["roster", participationId ?? "", "participation"],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      getParticipationRosters(pageParam, participationId),
    ...pagedQueryOptions("medium"),
  });
};
