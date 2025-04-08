"use client";

import AddIcon from "@mui/icons-material/Add";
import { IExtendedTournamentResponse } from "@tournament-app/types";
import { useGetTournamentStages } from "api/client/hooks/stages/useGetTournamentStages";
import { clsx } from "clsx";
import Button from "components/button";
import ProgressWheel from "components/progressWheel";
import StageCard from "components/stageCard";
import Link from "next/link";
import { useState } from "react";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import styles from "./viewStages.module.scss";

export default function ViewStages({
  tournament,
}: {
  tournament?: IExtendedTournamentResponse;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const {
    data,
    isLoading,
    fetchNextPage,
    isFetchNextPageError,
    isFetching,
    hasNextPage,
  } = useGetTournamentStages(tournament?.id);

  return (
    <div
      className={clsx(
        styles.wrapper,
        globals[`${textColorTheme}BackgroundColor`],
        globals[`${theme}Color`]
      )}
    >
      <h2 className={globals[`${theme}Color`]}>
        stages {tournament && `for ${tournament.name}`}
      </h2>
      <div className={styles.pagination}>
        {isLoading ? (
          <ProgressWheel variant={textColorTheme} />
        ) : (
          <div>
            {data?.pages[0].results.length == 0 ? (
              <p>there are no stages!</p>
            ) : (
              data?.pages.map((page, i) => {
                return (
                  <div
                    key={i}
                    className={clsx(
                      styles.stagesContainer,
                      styles[`${theme}Color`]
                    )}
                  >
                    {page.results.map((stage) => (
                      <Link
                        key={stage.id}
                        className={clsx(styles.stageItem)}
                        href={`/stage/${stage.id}`}
                      >
                        <StageCard
                          location={stage.location ? "offline" : "online"} // TODO: fix location type when implemented
                          variant={theme}
                          label={stage.name}
                          locationDetails={stage.location?.name}
                          participants={stage.rostersParticipating}
                          startDate={stage.startDate}
                          endDate={stage.endDate}
                          status={stage.stageStatus}
                          type={stage.stageType}
                        />
                      </Link>
                    ))}
                  </div>
                );
              })
            )}
          </div>
        )}
        {!isFetchNextPageError && hasNextPage && !isFetching && (
          <Button
            className={styles.loadMore}
            onClick={() => fetchNextPage()}
            variant="primary"
            label="load more"
          />
        )}
      </div>
    </div>
  );
}
