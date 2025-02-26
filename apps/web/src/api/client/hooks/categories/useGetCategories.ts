"use client";

import { useQuery } from "@tanstack/react-query";
import {
  CategoryResponsesEnum,
  groupRoleEnumType,
  IBaseQueryResponse,
  ICategoryResponse,
  IExtendedTournamentResponse,
  IMiniGroupResponseWithCountry,
  TournamentResponseEnumType,
  TournamentResponsesEnum,
} from "@tournament-app/types";
import { baseApiUrl, clientApi, getAccessToken } from "api/client/base";
import { AxiosResponse } from "axios";
import { useAuth } from "../auth/useAuth";

export const getCategories = async () =>
  clientApi
    .get<
      never,
      AxiosResponse<IBaseQueryResponse<ICategoryResponse>>
    >(`/categories`, { params: { responseType: CategoryResponsesEnum.EXTENDED } })
    .then((res) => res.data);

export const useGetCategories = () => {
  return useQuery({
    queryKey: ["category", "me"],
    queryFn: getCategories,
    staleTime: Infinity,
    retryDelay: 10000,
    enabled: getAccessToken() !== null,
  });
};
