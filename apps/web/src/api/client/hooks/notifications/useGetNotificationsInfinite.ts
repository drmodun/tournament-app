"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { notificationTypeEnum } from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";
import { INotificationResponse } from "./types";

export const getNotificationsInfinite = async (
  page: number,
  types?: notificationTypeEnum[],
  isRead?: boolean,
) =>
  clientApi
    .get<never, AxiosResponse<INotificationResponse[]>>("/notifications", {
      params: {
        pageSize: 10,
        page,
        order: "desc",
        types: types?.length
          ? types?.length > 1
            ? types?.join(",")
            : types[0] + "," + types[0]
          : undefined,
        isRead,
      },
    })
    .then((res) => res.data);

export const useGetNotificationsInfinite = (params: {
  types?: notificationTypeEnum[];
  isRead?: boolean;
}) => {
  const { types, isRead } = params;

  return useInfiniteQuery({
    queryKey: ["notifications", "infinite", { types, isRead }],
    queryFn: ({ pageParam = 1 }: { pageParam?: number }) =>
      getNotificationsInfinite(pageParam, types, isRead),
    staleTime: 1000 * 60, // 1 minute
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
    getNextPageParam: (lastPage, pages) => {
      if (!lastPage || lastPage.length === 0) return undefined;
      return pages.length + 1;
    },
    initialPageParam: 1,
  });
};
