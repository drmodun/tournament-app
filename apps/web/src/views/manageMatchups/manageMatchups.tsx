"use client";

import {
  IMatchupResponseWithResultsAndScores,
  IResultsResponseWithScores,
  IRosterResponse,
  matchupTypeEnum,
} from "@tournament-app/types";
import { clsx } from "clsx";
import Chip from "components/chip";
import { useEffect, useState } from "react";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { formatDateTime } from "utils/mixins/formatting";
import styles from "./manageMatchups.module.scss";
import { useGetUserManagedMatchups } from "api/client/hooks/matchups/useGetUserManagedMatchups";
import ProgressWheel from "components/progressWheel";

interface IMatchupResponse {
  id: number;
  stageId: number;
  roundId: number;
  matchupType: string;
  startDate: Date;
  isFinished: boolean;
}

export interface IMatchupResponseWithRosters extends IMatchupResponse {
  rosters: IRosterResponse[];
}

export default function ManageMatchups({
  matchup,
}: {
  matchup?: IMatchupResponseWithResultsAndScores;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  return (
    <div
      className={clsx(
        styles.wrapper,
        globals[`${textColorTheme}BackgroundColor`]
      )}
    >
      <h3 className={globals[`${theme}Color`]}>manage matchup</h3>

      {matchup && <MatchupCard matchup={matchup} />}
    </div>
  );
}

const MatchupCard = ({
  matchup,
}: {
  matchup: IMatchupResponseWithResultsAndScores;
}) => {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  return (
    <div className={styles.matchupWrapper}>
      {matchup.results.map((res: IResultsResponseWithScores) => {
        //@ts-ignore
        const roster: IRosterResponse = res["roster"] ?? null;

        return (
          <div className={styles.resultWrapper} key={res.id}>
            <div
              className={clsx(
                styles.rosterWrapper,
                globals[`${theme}BackgroundColor`]
              )}
            >
              {(roster?.participation?.group?.logo ??
                roster?.participation?.user?.profilePicture) && (
                <img
                  src={
                    roster?.participation?.group?.logo ??
                    roster?.participation?.user?.profilePicture
                  }
                  className={styles.userPfp}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/profilePicture.png";
                  }}
                />
              )}
              <p className={globals[`${textColorTheme}Color`]}>
                {roster?.participation?.group?.name ??
                  roster?.participation?.user?.username}
              </p>
            </div>
            <div className={styles.scoresWrapper}>
              {res.scores.map((score, index) => {
                return (
                  <div
                    key={score.roundNumber ?? index + 1}
                    className={clsx(
                      score.isWinner
                        ? globals.primaryBackgroundColor
                        : globals.dangerBackgroundColor,
                      globals.lightColor,
                      styles.scoreWrapper
                    )}
                  >
                    <b className={globals.lightColor}>
                      {score.roundNumber ?? index + 1}.
                    </b>

                    <div
                      className={styles.scoreWrapper}
                      key={score.roundNumber}
                    >
                      {score.points} points
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      <div className={clsx(styles.details, globals[`${theme}Color`])}>
        {matchup.matchupType && (
          <div className={styles.detailsInfo}>
            <b>matchup type</b>
            <Chip
              variant="secondary"
              label={
                matchup.matchupType === matchupTypeEnum.ONE_VS_ONE
                  ? "1v1"
                  : "free for all"
              }
            />
          </div>
        )}
        {matchup.isFinished ? (
          <div className={styles.detailsInfo}>
            <b>is finished</b>
            <Chip
              variant="secondary"
              label={matchup.isFinished ? "yes" : "no"}
            />
          </div>
        ) : (
          matchup.startDate && (
            <div className={styles.detailsInfo}>
              <b>starting date</b>
              <Chip
                variant="secondary"
                label={formatDateTime(new Date(matchup.startDate))}
              />
            </div>
          )
        )}
      </div>
    </div>
  );
};
