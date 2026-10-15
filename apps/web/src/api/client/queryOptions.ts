import {
  getAccessToken,
  LARGE_QUERY_RETRY_ATTEMPTS,
  LARGE_QUERY_RETRY_DELAY,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
  SMALL_QUERY_RETRY_ATTEMPTS,
  SMALL_QUERY_RETRY_DELAY,
} from "api/client/base";

export type QuerySize = "small" | "medium" | "large";

const retryPresets = {
  small: {
    retry: SMALL_QUERY_RETRY_ATTEMPTS,
    retryDelay: SMALL_QUERY_RETRY_DELAY,
  },
  medium: {
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
  },
  large: {
    retry: LARGE_QUERY_RETRY_ATTEMPTS,
    retryDelay: LARGE_QUERY_RETRY_DELAY,
  },
} as const;

/** Retry count/delay for a query or mutation of the given size. */
export const retryOptions = (size: QuerySize) => retryPresets[size];

export const PAGE_SIZE = 10;

const nextPageFromResults = <P extends { results: unknown[] }>(
  lastPage: P,
  allPages: P[],
) => (lastPage.results.length < PAGE_SIZE ? undefined : allPages.length + 1);

const nextPageFromArray = <P extends unknown[]>(lastPage: P, allPages: P[]) =>
  lastPage.length < PAGE_SIZE ? undefined : allPages.length + 1;

const baseOptions = (size: QuerySize) => ({
  staleTime: Infinity,
  ...retryPresets[size],
  enabled: getAccessToken() !== null,
  initialPageParam: 1,
});

/** Authenticated, page-numbered infinite query whose pages are `{ results: [] }`. */
export const pagedQueryOptions = (size: QuerySize) => ({
  ...baseOptions(size),
  getNextPageParam: nextPageFromResults,
});

/** Same as `pagedQueryOptions`, for APIs that return a bare array per page. */
export const pagedArrayQueryOptions = (size: QuerySize) => ({
  ...baseOptions(size),
  getNextPageParam: nextPageFromArray,
});
