"use client";

import AddIcon from "@mui/icons-material/Add";
import { useGetTournamentStages } from "api/client/hooks/stages/useGetTournamentStages";
import { clsx } from "clsx";
import Button from "components/button";
import ProgressWheel from "components/progressWheel";
import StageCard from "components/stageCard";
import Link from "next/link";
import { ReactNode } from "react";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import styles from "./stageList.module.scss";

/** Paginated list of a tournament's stages, shown under a caller-provided header. */
export default function StageList({
  tournamentId,
  title,
  emptyText,
  onAdd,
  children,
}: {
  tournamentId?: number;
  title: string;
  emptyText: string;
  /** When set, the header becomes an editor header with an "add" button. */
  onAdd?: () => void;
  /** Rendered before the header, e.g. a dialog. */
  children?: ReactNode;
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
  } = useGetTournamentStages(tournamentId);

  return (
    <div
      className={clsx(
        styles.wrapper,
        globals[`${textColorTheme}BackgroundColor`],
        globals[`${theme}Color`],
      )}
    >
      {children}
      {onAdd ? (
        <div className={styles.header}>
          <h3 className={globals[`${theme}Color`]}>{title}</h3>
          <button className={styles.addIconButton} onClick={onAdd}>
            <AddIcon className={globals[`${theme}FillChildren`]} />
          </button>
        </div>
      ) : (
        <h2 className={globals[`${theme}Color`]}>{title}</h2>
      )}
      <div className={styles.pagination}>
        {isLoading ? (
          <ProgressWheel variant={textColorTheme} />
        ) : (
          <div>
            {data?.pages[0].results.length == 0 ? (
              <p>{emptyText}</p>
            ) : (
              data?.pages.map((page, i) => {
                return (
                  <div
                    key={i}
                    className={clsx(
                      styles.stagesContainer,
                      styles[`${theme}Color`],
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
