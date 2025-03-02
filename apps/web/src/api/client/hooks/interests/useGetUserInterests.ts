"use client";

import { useQuery } from "@tanstack/react-query";
import { IBaseQueryResponse } from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";
import { useEffect } from "react";
import { useToastContext } from "utils/hooks/useToastContext";

type Interest = {
  id: number;
  name: string;
  image: string;
  type: string;
  description: string;
};

export const getUserInterests = async () =>
  clientApi
    .get<
      never,
      AxiosResponse<IBaseQueryResponse<Interest>>
    >(`/interest`, { params: { pageSize: 50, page: 1 } })
    .then((res) => res.data);

export const useGetUserInterests = () => {
  return useQuery({
    queryKey: ["interest", "me"],
    queryFn: getUserInterests,
    staleTime: Infinity,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
  });
};
