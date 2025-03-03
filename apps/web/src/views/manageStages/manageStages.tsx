"use client";

import styles from "./manageStages.module.scss";
import globals from "styles/globals.module.scss";
import { clsx } from "clsx";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import Dialog from "components/dialog";
import Button from "components/button";
import { useEffect, useRef, useState } from "react";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { textColor } from "types/styleTypes";
import { useGetUserGroupInvites } from "api/client/hooks/groupInvites/useGetUserGroupInvites";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { useAcceptGroupInvite } from "api/client/hooks/groupInvites/useAcceptGroupInvite";
import { useDeclineGroupInvite } from "api/client/hooks/groupInvites/useDeclineGroupInvite";
import ProgressWheel from "components/progressWheel";
import { useGetTournamentStages } from "api/client/hooks/stages/useGetTournamentStages";
import { ITournamentResponse } from "@tournament-app/types";
import { formatDateTime } from "utils/mixins/formatting";
import Link from "next/link";
import AddIcon from "@mui/icons-material/Add";
import AddStageForm from "views/addStageForm";

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

  useEffect(() => {
    console.log("stages", data);
  }, [data]);

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
        <AddStageForm tournamentId={tournamentId} />
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
              data?.pages.map((page, i) => (
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
                      className={clsx(
                        styles.stageItem,
                        globals[`${textColorTheme}MutedBackgroundColor`],
                        styles[`${theme}Color`],
                      )}
                      href={`/stage/${stage.id}`}
                    >
                      <h4 className={styles.title}>
                        {stage.name}{" "}
                        <span className={globals.label}>
                          ({formatDateTime(stage.startDate)} -{" "}
                          {formatDateTime(stage.endDate)})
                        </span>
                      </h4>
                      {stage.minPlayersPerTeam && (
                        <p className={globals.label}>
                          minimum players per team{" "}
                          <b className={styles.info}>
                            {" "}
                            {stage.minPlayersPerTeam}
                          </b>
                        </p>
                      )}
                      {stage.maxPlayersPerTeam && (
                        <p className={globals.label}>
                          minimum players per team{" "}
                          <b className={styles.info}>
                            {" "}
                            {stage.maxPlayersPerTeam}
                          </b>
                        </p>
                      )}
                      <p className={globals.label}>
                        status{" "}
                        <b className={styles.info}> {stage.stageStatus}</b>
                      </p>
                      {stage?.location?.name && (
                        <p className={globals.label}>
                          location{" "}
                          <b className={styles.info}>
                            {" "}
                            {stage?.location?.name}
                          </b>
                        </p>
                      )}
                      <p className={globals.label}>
                        stage type{" "}
                        <b className={styles.info}> {stage.stageType}</b>
                      </p>
                      <p className={globals.label}>
                        rosters participating{" "}
                        <b className={styles.info}>
                          {" "}
                          {stage.rostersParticipating}
                        </b>
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
                          {stage.description}
                        </Markdown>
                      </div>
                    </Link>
                  ))}
                </div>
              ))
            )}
          </div>
        )}
        <Button
          className={styles.loadMore}
          onClick={() => fetchNextPage()}
          disabled={isFetchNextPageError || !hasNextPage || isFetching}
          variant="primary"
          label="load more"
        />
      </div>
    </div>
  );
}
