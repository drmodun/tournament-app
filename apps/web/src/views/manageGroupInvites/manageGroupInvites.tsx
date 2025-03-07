"use client";

import { useAcceptGroupInvite } from "api/client/hooks/groupInvites/useAcceptGroupInvite";
import { useDeclineGroupInvite } from "api/client/hooks/groupInvites/useDeclineGroupInvite";
import { useGetUserGroupInvites } from "api/client/hooks/groupInvites/useGetUserGroupInvites";
import { clsx } from "clsx";
import Button from "components/button";
import ProgressWheel from "components/progressWheel";
import { useEffect, useRef } from "react";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import styles from "./manageGroupInvites.module.scss";

export default function ManageGroupInvites() {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const {
    data,
    isLoading,
    fetchNextPage,
    isFetchNextPageError,
    isFetching,
    hasNextPage,
  } = useGetUserGroupInvites();

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver>();

  useEffect(() => {
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

  const acceptInviteMutation = useAcceptGroupInvite();
  const declineInviteMutation = useDeclineGroupInvite();

  return (
    <div
      className={clsx(
        styles.wrapper,
        globals[`${textColorTheme}BackgroundColor`],
        globals[`${theme}Color`],
      )}
    >
      <div className={styles.header}>
        <h3 className={globals[`${theme}Color`]}>manage your group invites</h3>
      </div>

      <div className={styles.infiniteLoad}>
        {isLoading ? (
          <ProgressWheel variant={textColorTheme} />
        ) : (
          <>
            {data?.pages.map((page, i) => (
              <div
                key={i}
                className={clsx(
                  styles.invitesContainer,
                  styles[`${theme}Color`],
                )}
              >
                {page.results.map((invite) => (
                  <div
                    key={invite.id}
                    className={clsx(
                      styles.inviteItem,
                      globals[`${textColorTheme}MutedBackgroundColor`],
                    )}
                  >
                    <h4 className={styles.title}>
                      {invite.name}{" "}
                      <span className={globals.label}>
                        ({invite.abbreviation})
                      </span>
                    </h4>
                    <p className={globals.label}>
                      country <b className={styles.info}> {invite.country}</b>
                    </p>
                    <p className={globals.label}>
                      location{" "}
                      <b className={styles.info}> {invite.location?.name}</b>
                    </p>
                    <p className={globals.label}>
                      type <b className={styles.info}> {invite.type}</b>
                    </p>
                    <div>
                      <p className={globals.label}>description</p>
                      <Markdown
                        className={clsx(
                          globals[`${textColorTheme}Color`],
                          globals[`${theme}BackgroundColor`],
                          styles.description,
                        )}
                        rehypePlugins={[rehypeRaw]}
                      >
                        {invite.description}
                      </Markdown>
                    </div>
                    <div>
                      <p className={globals.label}>message</p>
                      <Markdown
                        className={clsx(
                          globals[`${textColorTheme}Color`],
                          globals[`${theme}BackgroundColor`],
                          styles.description,
                        )}
                        rehypePlugins={[rehypeRaw]}
                      >
                        {invite.message}
                      </Markdown>
                    </div>
                    <div className={styles.actionButtons}>
                      <Button
                        variant="primary"
                        className={styles.actionButton}
                        label="accept"
                        onClick={() => acceptInviteMutation.mutate(invite.id)}
                      />
                      <Button
                        variant="danger"
                        className={styles.actionButton}
                        label="decline"
                        onClick={() => declineInviteMutation.mutate(invite.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <div ref={loadMoreRef} className={styles.loadMoreTrigger}>
              {isFetching && hasNextPage && (
                <ProgressWheel variant={textColorTheme} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
