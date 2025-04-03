"use client";

import AddIcon from "@mui/icons-material/Add";
import {
  IBaseQueryResponse,
  IExtendedUserResponse,
  IGroupMembershipResponse,
  IMiniUserResponseWithProfilePicture,
} from "@tournament-app/types";
import { useAuth } from "api/client/hooks/auth/useAuth";
import { useGetUserOrganizedCompetitions } from "api/client/hooks/competitions/useGetUserOrganizedCompetitions";
import { clsx } from "clsx";
import CardExpanded from "components/cardExpanded";
import Dialog from "components/dialog";
import ProgressWheel from "components/progressWheel";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import CreateTournamentForm from "views/createTournamentForm";
import styles from "./manageBlockedUsers.module.scss";
import { useGetBlockedUsers } from "api/client/hooks/blockedUsers/useGetBlockedUsers";
import InfiniteDropdown from "components/infiniteDropdown";
import { useAdminUserGroups } from "api/client/hooks/groups/useAdminUserGroups";
import DeleteIcon from "@mui/icons-material/Delete";
import Button from "components/button";
import { useDeleteBlockedUser } from "api/client/hooks/blockedUsers/useDeleteBlockedUser";
import { group } from "console";

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
  const textColorTheme = textColor(theme);

  const deleteBlockedUserMutation = useDeleteBlockedUser();

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver>();

  useEffect(() => {
    if (!adminData || !hasNextPage || isFetching || isFetchNextPageError)
      return;
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (
          first.isIntersecting &&
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
  }, [isFetching, isFetchNextPageError, fetchNextPage, hasNextPage]);

  return (
    <div
      className={clsx(
        styles.wrapper,
        globals[`${textColorTheme}BackgroundColor`],
      )}
    >
      <div className={styles.competitionsTitle}>
        <b className={clsx(globals[`${theme}Color`], styles.title)}>
          blocked users
        </b>
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
      </div>
      {adminIsLoading ? (
        <ProgressWheel variant={textColorTheme} />
      ) : (
        <div className={styles.blockedUsersWrapper}>
          <div className={styles.blockedUsers}>
            {(blockedUsers?.pages[0].results.length ?? -1) <= 0 ? (
              <div>
                <p className={globals[`${theme}Color`]}>
                  there are no blocked users for this group!
                </p>
              </div>
            ) : (
              blockedUsers?.pages.map((page) =>
                page?.results.map((card, index) => {
                  return (
                    <div
                      className={clsx(
                        styles.userCard,
                        globals[`${textColorTheme}Color`],
                        globals[`${theme}BackgroundColor`],
                      )}
                      key={index}
                    >
                      <div className={styles.leftContent}>
                        <img
                          src={card.profilePicture}
                          onError={(e) =>
                            (e.currentTarget.src = "/profilePicture.png")
                          }
                          className={styles.pfp}
                        />
                        <p>{card.username}</p>
                      </div>
                      <Button
                        variant="danger"
                        onClick={() =>
                          deleteBlockedUserMutation.mutate({
                            groupId: selectedGroup?.group?.id,
                            userId: card.id,
                          })
                        }
                      >
                        <DeleteIcon
                          className={clsx(
                            globals.lightFillChildren,
                            styles.trashButton,
                          )}
                        />
                      </Button>
                    </div>
                  );
                }),
              )
            )}
          </div>
          <div ref={loadMoreRef} className={styles.loadMore}>
            {isFetching && <ProgressWheel variant={textColorTheme} />}
          </div>
        </div>
      )}
    </div>
  );
}
