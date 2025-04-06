import { useQuery } from "@tanstack/react-query";
import {
  IExtendedStageResponseWithTournament,
  StageResponsesEnum,
} from "@tournament-app/types";
import {
  clientApi,
  SMALL_QUERY_RETRY_ATTEMPTS,
  SMALL_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";

export const getStage = async (stageId: number | undefined) =>
  clientApi
    .get<
      never,
      AxiosResponse<IExtendedStageResponseWithTournament>
    >(`/stages/${stageId}`, { params: { id: stageId, responseType: StageResponsesEnum.WITH_EXTENDED_TOURNAMENT } })
    .then((res) => res.data);

export const useGetStage = (stageId?: number) => {
  return useQuery({
    queryKey: ["stage", stageId],
    queryFn: () => getStage(stageId),
    staleTime: Infinity,
    retryDelay: SMALL_QUERY_RETRY_DELAY,
    retry: SMALL_QUERY_RETRY_ATTEMPTS,
  });
};
