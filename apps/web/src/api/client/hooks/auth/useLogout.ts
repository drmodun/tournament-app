"use client";

import { useQueryClient } from "@tanstack/react-query";
import { clearAuthTokens } from "api/client/base";

export const useLogout = () => {
  const queryClient = useQueryClient();

  return () => {
    clearAuthTokens();
    queryClient.invalidateQueries({
      predicate: (query) => query.queryKey.includes("me"),
    });
    queryClient.setQueryData(["me"], null);
  };
};
