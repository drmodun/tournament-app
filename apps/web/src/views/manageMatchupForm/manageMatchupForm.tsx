"use client";

import AddIcon from "@mui/icons-material/Add";
import { ICreateMatchResult, ICreateScoreRequest } from "@tournament-app/types";
import { useGetRoster } from "api/client/hooks/rosters/useGetRoster";
import { clsx } from "clsx";
import Button from "components/button";
import Dialog from "components/dialog";
import Input from "components/input";
import ProgressWheel from "components/progressWheel";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import AddMatchResult from "views/addMatchResult";
import styles from "./manageMatchupForm.module.scss";

/*
export interface ICreateTeamScore {
  rosterId: number;
  points: number;
  isWinner: boolean;
}

export interface ICreateScoreRequest {
  roundNumber: number;
  scores: ICreateTeamScore[];
}

export interface ICreateMatchResult {
  roundNumber: number;
  scores: ICreateTeamScore[];
}
*/

export default function ManageMatchupForm({
  onClose,
  rosterId1,
  rosterId2,
}: {
  onClose?: () => void;
  rosterId1?: number;
  rosterId2?: number;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const methods = useForm<ICreateMatchResult>();
  const onSubmit = async (data: ICreateMatchResult) => {
    data.scores;
    onClose && onClose();
  };

  /*

  ICreateMatchResult {
    roundNumber: number;
    scores: {
      rosterId: number;
      points: number;
      isWinner: boolean;
    }[];
  } 
  */

  const [scores, setScores] = useState<Partial<ICreateScoreRequest>[]>([
    {
      roundNumber: 1,
      scores: [
        {
          rosterId: 1,
          points: 10,
          isWinner: true,
        },
        {
          rosterId: 2,
          points: 9,
          isWinner: false,
        },
      ],
    },
    {
      roundNumber: 2,
      scores: [
        {
          rosterId: 1,
          points: 11,
          isWinner: true,
        },
        {
          rosterId: 2,
          points: 9,
          isWinner: false,
        },
      ],
    },
  ]);

  const { data: team1, isLoading: isLoading1 } = useGetRoster(rosterId1 ?? -1);
  const { data: team2, isLoading: isLoading2 } = useGetRoster(rosterId2 ?? -1);

  const [addMatchModalOpen, setAddMatchModalOpen] = useState<boolean>(false);

  const [result1, setResult1] = useState<number>();
  const [result2, setResult2] = useState<number>();

  const [winnerFirst, setWinnerFirst] = useState<boolean>(true);

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className={styles.innerFormWrapper}
      >
        <Dialog
          onClose={() => setAddMatchModalOpen(false)}
          active={addMatchModalOpen}
          variant={theme}
        >
          <AddMatchResult onClose={() => setAddMatchModalOpen(false)} />
        </Dialog>
        <h3 className={clsx(globals[`${textColorTheme}Color`], styles.title)}>
          matchup result
        </h3>
        {isLoading1 || isLoading2 ? (
          <div>
            <ProgressWheel variant={textColorTheme} />
          </div>
        ) : (
          <div className={styles.contentWrapper}>
            <div className={styles.versusLayout}>
              <div className={styles.userCards}>
                {(team1?.players ?? []).map((player) => {
                  return (
                    <div
                      className={clsx(
                        styles.userCard,
                        globals[`${textColorTheme}BackgroundColor`],
                      )}
                    >
                      <img
                        src={player.user.profilePicture}
                        onError={(e) =>
                          (e.currentTarget.src = "./profilePicture.png")
                        }
                        className={styles.userPfp}
                      />
                      <p className={globals[`${theme}Color`]}>
                        {player.user.username}
                      </p>
                    </div>
                  );
                })}
              </div>
              <p className={globals[`${textColorTheme}Color`]}>vs</p>
              <div className={styles.userCards}>
                {(team2?.players ?? []).map((player) => {
                  return (
                    <div
                      className={clsx(
                        styles.userCard,
                        globals[`${textColorTheme}BackgroundColor`],
                      )}
                    >
                      <img
                        src={player.user.profilePicture}
                        onError={(e) =>
                          (e.currentTarget.src = "./profilePicture.png")
                        }
                        className={styles.userPfp}
                        width={64}
                        height={64}
                      />
                      <p className={globals[`${theme}Color`]}>
                        {player.user.username}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className={styles.matchesLabel}>
              <p
                className={clsx(
                  globals.label,
                  globals[`${textColorTheme}Color`],
                )}
              >
                matches
              </p>
              <Button
                variant="primary"
                className={styles.addButton}
                onClick={() => setAddMatchModalOpen(true)}
              >
                <AddIcon className={globals.lightFillChildren} />
              </Button>
            </div>
            <div className={styles.results}>
              {scores.map((score) => {
                return (
                  <div className={styles.resultsCard}>
                    <p className={globals[`${textColorTheme}Color`]}>
                      {score.roundNumber}.
                    </p>
                    <div className={styles.scores}>
                      <div
                        className={clsx(
                          styles.score,
                          globals.lightColor,
                          score?.scores?.[0].isWinner
                            ? globals.primaryBackgroundColor
                            : globals.dangerBackgroundColor,
                        )}
                      >
                        {score?.scores?.[0].points}
                      </div>
                      <p className={globals[`${textColorTheme}Color`]}>-</p>
                      <div
                        className={clsx(
                          styles.score,
                          globals.lightColor,
                          score?.scores?.[1].isWinner
                            ? globals.primaryBackgroundColor
                            : globals.dangerBackgroundColor,
                        )}
                      >
                        {score?.scores?.[1].points}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div>
              <p
                className={clsx(
                  globals.label,
                  globals[`${textColorTheme}Color`],
                )}
              >
                final result
              </p>
              <div className={styles.finalResultInputs}>
                <Input variant={textColorTheme} placeholder="team 1 score" />
                <p className={globals[`${textColorTheme}Color`]}>-</p>
                <Input variant={textColorTheme} placeholder="team 2 score" />
              </div>
            </div>
            <Button variant="primary" label="submit" />
          </div>
        )}
      </form>
    </FormProvider>
  );
}
