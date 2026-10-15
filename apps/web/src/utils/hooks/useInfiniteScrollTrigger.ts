import { useEffect, useRef } from "react";

type InfiniteScrollOptions = {
  fetchNextPage: () => unknown;
  hasNextPage: boolean;
  isFetching: boolean;
  isFetchNextPageError: boolean;
  /** Set to false to stop observing, e.g. while the first page is still loading. */
  enabled?: boolean;
};

/**
 * Returns a ref for a sentinel element; fetches the next page whenever the
 * sentinel scrolls into view and nothing is already loading.
 */
export const useInfiniteScrollTrigger = ({
  fetchNextPage,
  hasNextPage,
  isFetching,
  isFetchNextPageError,
  enabled = true,
}: InfiniteScrollOptions) => {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | undefined>(undefined);

  useEffect(() => {
    if (!enabled) return;
    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !isFetching &&
          !isFetchNextPageError &&
          hasNextPage
        ) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observerRef.current.observe(currentRef);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [enabled, isFetching, isFetchNextPageError, fetchNextPage, hasNextPage]);

  return loadMoreRef;
};
