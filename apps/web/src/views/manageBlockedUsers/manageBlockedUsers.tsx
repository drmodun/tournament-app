"use client";

import { IGroupMembershipResponse } from "@tournament-app/types";
import BlockedList from "components/blockedList";
import { useState } from "react";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { useGetBlockedUsers } from "api/client/hooks/blockedUsers/useGetBlockedUsers";
import InfiniteDropdown from "components/infiniteDropdown";
import { useAdminUserGroups } from "api/client/hooks/groups/useAdminUserGroups";
import { useDeleteBlockedUser } from "api/client/hooks/blockedUsers/useDeleteBlockedUser";
import { useInfiniteScrollTrigger } from "utils/hooks/useInfiniteScrollTrigger";

export default function ManageBlockedUsers() {
  const { theme } = useThemeContext();

  const [selectedGroup, setSelectedGroup] =
    useState<IGroupMembershipResponse>();

  const {
    data: blockedUsers,
    isFetching,
    isFetchNextPageError,
    fetchNextPage,
    hasNextPage,
  } = useGetBlockedUsers(selectedGroup?.group?.id);
  const {
    data: adminData,
    isFetching: adminIsFetching,
    isLoading: adminIsLoading,
  } = useAdminUserGroups();

  const deleteBlockedUserMutation = useDeleteBlockedUser();

  const loadMoreRef = useInfiniteScrollTrigger({
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchNextPageError,
    enabled: !!adminData,
  });

  return (
    <BlockedList
      variant={theme}
      title="blocked users"
      emptyText="there are no blocked users for this group!"
      header={
        <InfiniteDropdown
          options={
            adminData?.pages?.flatMap((page) => {
              return page.results?.flatMap((res) => {
                return {
                  label: res.group.name,
                };
              });
            }) ?? []
          }
          isFetching={adminIsFetching}
          loadMore={async () => {
            await fetchNextPage();
          }}
          variant={theme}
          placeholder="select group"
          onSelect={(index: number) => {
            setSelectedGroup(
              (adminData?.pages?.flatMap((page) => {
                return page.results?.flatMap((res) => res);
              }) ?? [])[index],
            );
          }}
        />
      }
      items={blockedUsers?.pages.flatMap((page) =>
        page?.results.map((card) => ({
          id: card.id,
          name: card.username,
          image: card.profilePicture,
        })),
      )}
      isLoading={adminIsLoading}
      isFetching={isFetching}
      loadMoreRef={loadMoreRef}
      onRemove={(userId) =>
        deleteBlockedUserMutation.mutate({
          groupId: selectedGroup?.group?.id,
          userId,
        })
      }
    />
  );
}
