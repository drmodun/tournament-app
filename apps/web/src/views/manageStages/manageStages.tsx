"use client";

import AddIcon from "@mui/icons-material/Add";
import { useGetTournamentStages } from "api/client/hooks/stages/useGetTournamentStages";
import { clsx } from "clsx";
import Button from "components/button";
import Dialog from "components/dialog";
import ProgressWheel from "components/progressWheel";
import Link from "next/link";
import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { formatDateTime } from "utils/mixins/formatting";
import AddStageForm from "views/addStageForm";
import styles from "./manageStages.module.scss";
import StageCard from "components/stageCard";

export default function ManageStages({
  tournamentId,
}: {
  tournamentId?: number;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

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
      <Dialog
        variant={theme}
        active={dialogOpen}
        onClose={() => setDialogOpen(false)}
      >
        <AddStageForm
          tournamentId={tournamentId}
          onClose={() => setDialogOpen(false)}
        />
      </Dialog>
      <div className={styles.header}>
        <h3 className={globals[`${theme}Color`]}>manage your stages</h3>
        <button
          className={styles.addIconButton}
          onClick={() => setDialogOpen(true)}
        >
          <AddIcon className={globals[`${theme}FillChildren`]} />
        </button>
      </div>

      <div className={styles.pagination}>
        {isLoading ? (
          <ProgressWheel variant={textColorTheme} />
        ) : (
          <div>
            {data?.pages[0].results.length == 0 ? (
              <p>you have no stages!</p>
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
