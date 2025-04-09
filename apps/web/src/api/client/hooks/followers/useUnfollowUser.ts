"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "api/client/base";
import { AxiosError, AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";
import { handleError } from "utils/mixins/helpers";

export const unfollowUser = async (userId: number) =>
  clientApi
    .delete<never, AxiosResponse>(`/followers/${userId}`)
    .then((res) => res.data);

export const useUnfollowUser = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unfollowUser,
    retryDelay: 10000,
    onSuccess: async () => {
      toast.addToast("successfully unfollowed user", "success");
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("follower"),
      });
      return true;
    },
    onError: (e: AxiosError<{ message: string & string[] }>) => {
      const err = handleError(e);
      err && toast.addToast(err, "error");
    },
    onMutate: () => {
      toast.addToast("unfollowing user...", "info");
    },
  });
};
