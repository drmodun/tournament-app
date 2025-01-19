import {
  IEmailPasswordLoginRequest,
  IUserLoginResponse,
} from "@tournament-app/types";
import { clientApi, setAuthTokens } from "api/client/base";
import { useMutation } from "@tanstack/react-query";
import { useToastContext } from "utils/hooks/useToastContext";
import { useRouter } from "next/router";
import { setTimeout } from "node:timers";
import { useAuth } from "./useAuth";

export const loginUser = async (data: IEmailPasswordLoginRequest) =>
  clientApi.post<IEmailPasswordLoginRequest, IUserLoginResponse>(
    "/auth/login",
    data
  );
// TODO: make google login later

export const useLogin = () => {
  const toast = useToastContext();
  const navigate = useRouter();
  const { refetch } = useAuth();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: async (data) => {
      setAuthTokens(data.accessToken, data.refreshToken);
      toast.addToast("Successfully logged in", "success"); //TODO: make this an object for easier and more consistent usage
      await refetch();
      
      setTimeout(() => navigate.push("/"), 1000);
    },
    onError: (error: any) => {
      toast.addToast("Invalid credentials", "error"); //TODO: maybe make this show the server error message, or just log it
      console.error(error);
    },
    onMutate: () => {
      toast.addToast("Logging in...", "info");
    },
  });
};
