"use client";

import { useQuery } from "@tanstack/react-query";
import {
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
  getAccessToken,
} from "api/client/base";
import { getNotifications } from "./serverFetches";
import { NotificationQueryParams } from "./types";

export const useGetNotifications = (params: NotificationQueryParams = {}) => {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: () => getNotifications(params),
    staleTime: 1000 * 60, // 1 minute
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
  });
};
