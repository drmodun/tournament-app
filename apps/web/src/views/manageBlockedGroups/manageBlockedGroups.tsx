"use client";

import { useGetBlockedGroups } from "api/client/hooks/blockedGroups/useGetBlockedGroups";
import { useDeleteBlockedGroup } from "api/client/hooks/blockedGroups/useDeleteBlockedGroup";
import { useGetUserOrganizedCompetitions } from "api/client/hooks/competitions/useGetUserOrganizedCompetitions";
import BlockedList from "components/blockedList";
import { useInfiniteScrollTrigger } from "utils/hooks/useInfiniteScrollTrigger";
import { useThemeContext } from "utils/hooks/useThemeContext";

export default function ManageBlockedGroups() {
  const { theme } = useThemeContext();

  const {
    data: blockedGroups,
    isFetching,
    isFetchNextPageError,
    fetchNextPage,
    hasNextPage,
  } = useGetBlockedGroups();
  const { isLoading, data } = useGetUserOrganizedCompetitions();

  const deleteBlockedGroupMutation = useDeleteBlockedGroup();

  const loadMoreRef = useInfiniteScrollTrigger({
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchNextPageError,
    enabled: !!data,
  });

  return (
    <BlockedList
      variant={theme}
      title="your blocked users"
      emptyText="you have no blocked groups!"
      items={blockedGroups?.pages.flatMap((page) =>
        page?.results.map((card) => ({
          id: card.id,
          name: card.name,
          image: card.logo,
        })),
      )}
      isLoading={isLoading}
      isFetching={isFetching}
      loadMoreRef={loadMoreRef}
      onRemove={(id) => deleteBlockedGroupMutation.mutate(id)}
    />
  );
}
