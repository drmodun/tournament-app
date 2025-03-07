"use client";

import { useMutation } from "@tanstack/react-query";
import {
  IBaseQueryResponse,
  IParticipationResponse,
  ParticipationResponsesEnum,
} from "@tournament-app/types";
import { clientApi } from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";

export const checkIfGroupIsParticipating = async (data: {
  tournamentId?: number;
  groupId?: number;
}) =>
  clientApi
    .get<never, AxiosResponse<IBaseQueryResponse<IParticipationResponse>>>(
      `/participations`,
      {
        params: {
          responseType: ParticipationResponsesEnum.BASE,
          ...data,
        },
      },
    )
    .then((res) => {
      return res.data;
    });
export const useCheckIfGroupIsParticipating = () => {
  const toast = useToastContext();

  return useMutation({
    mutationKey: ["me", "group"],
    mutationFn: checkIfGroupIsParticipating,
    retryDelay: 5000,
    onSuccess: async (data) => {
      if (data?.results?.length ?? -1 > 0) {
        toast.addToast("group is already participating!", "error");
        return false;
      }
      return true;
    },
    onError: (error: any) => {
      console.error(error);
      return false;
    },
  });
};
