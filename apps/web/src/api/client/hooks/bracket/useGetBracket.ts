import { useQuery } from "@tanstack/react-query";
import { clientApi } from "api/client/base";

const getBracket = async (stageId: number) => {
  const response = await clientApi.get(`matches/stage/${stageId}/bracket`);
  return response.data;
};

export const useGetBracket = (stageId: number) => {
  return useQuery({
    queryKey: ["bracket", stageId],
    queryFn: () => getBracket(stageId),
  });
};
