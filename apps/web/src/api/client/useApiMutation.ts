"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { retryOptions, type QuerySize } from "api/client/queryOptions";
import { toastHandlers } from "api/client/toastHandlers";
import { useToastContext } from "utils/hooks/useToastContext";

type ApiMutationOptions<TData, TVariables> = {
  mutationFn: (variables: TVariables) => Promise<TData>;
  size: QuerySize;
  /** Toast shown while the request is in flight. */
  pending: string;
  /** Toast shown once the request succeeds. */
  success: string;
  /** Queries whose key contains any of these segments are invalidated on success. */
  invalidate?: string[];
  /** Runs after the invalidations, e.g. to revalidate server-side caches. */
  afterSuccess?: () => void | Promise<void>;
};

/**
 * `useMutation` with the app-wide conventions: retry preset, pending/success/error
 * toasts and invalidation of related queries.
 */
export const useApiMutation = <TData, TVariables = void>({
  mutationFn,
  size,
  pending,
  success,
  invalidate = [],
  afterSuccess,
}: ApiMutationOptions<TData, TVariables>) => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    ...retryOptions(size),
    onSuccess: async () => {
      toast.addToast(success, "success");
      for (const key of invalidate) {
        await queryClient.invalidateQueries({
          predicate: (query) => query.queryKey.includes(key),
        });
      }
      await afterSuccess?.();
    },
    ...toastHandlers(toast, pending),
  });
};
