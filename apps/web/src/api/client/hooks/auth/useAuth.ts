import { useQuery } from "@tanstack/react-query";
import { IExtendedUserResponse } from "@tournament-app/types";
import { clientApi, getAccessToken } from "api/client/base";

export const getAuthenticatedUser = async () =>
  clientApi.get<never, IExtendedUserResponse>("/auth/user");

export const useAuth = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: getAuthenticatedUser,
    staleTime: Infinity,
    enabled: getAccessToken() !== null,
  });
};
