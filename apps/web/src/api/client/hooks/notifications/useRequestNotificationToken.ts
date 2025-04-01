"use client";

import { useMutation } from "@tanstack/react-query";
import { requestNewToken } from "./serverFetches";

export const useRequestNotificationToken = () => {
  return useMutation({
    mutationFn: requestNewToken,
  });
};
