"use client";

import { useGetCompetitions } from "api/client/hooks/competitions/useGetCompetitions";
import { clsx } from "clsx";
import Button from "components/button";
import CardExpanded from "components/cardExpanded";
import ProgressWheel from "components/progressWheel";
import { useState } from "react";
import globals from "styles/globals.module.scss";
import { useThemeContext } from "utils/hooks/useThemeContext";
import styles from "./events.module.scss";
import { textColor } from "types/styleTypes";

export default function Events() {
  const { theme } = useThemeContext();
  const {
    data,
    isLoading,
    fetchNextPage,
    isFetching,
    isFetchNextPageError,
    isFetchingNextPage,
  } = useGetCompetitions();
  const [page, setPage] = useState<number>(0);
  const [fetchLimit, setFetchLimit] = useState<number>(-1);

  const forward = async () => {
    if (fetchLimit == page) return;

    const fetch = await fetchNextPage();

    if (fetch.data?.pages[page + 1].results.length == 0) {
      setFetchLimit(page);
      return;
    }

    setPage((prev) => prev + 1);
  };
  return (
    <div className={clsx(styles.wrapper)}>
      <div className={styles.title}>
        <p>
          <b
            className={clsx(
              styles[`${theme}Header`],
              styles.header,
              globals.largeText,
            )}
          >
            events
          </b>
        </p>
        {isFetching || isFetchNextPageError || isFetchingNextPage ? (
          <ProgressWheel />
        ) : (
          <Button
            onClick={forward}
            disabled={
              fetchLimit === page ||
              isFetching ||
              isFetchNextPageError ||
              isFetchingNextPage
            }
            label="load more"
            variant="secondary"
          />
        )}
      </div>

      {isLoading ? (
        <ProgressWheel />
      ) : (
        <div className={styles.outerEventsWrapper}>
          {data?.pages?.map((page) =>
            page?.results?.map((event) => {
              return (
                <CardExpanded
                  variant={theme}
                  label={event.name}
                  location={event.location}
                  locationDetails={event.actualLocation?.name}
                  image={event.logo ?? `/${textColor(theme)}.png`}
                  startDate={new Date(event.startDate.toString()).getTime()}
                  endDate={new Date(event.endDate.toString()).getTime()}
                  organizerName={event.creator.username}
                  category={event.category.name}
                  id={event.id}
                  style={{ width: "100%" }}
                />
              );
            }),
          )}
        </div>
      )}
    </div>
  );
}
