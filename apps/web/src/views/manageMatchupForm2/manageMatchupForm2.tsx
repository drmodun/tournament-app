"use client";

import AddIcon from "@mui/icons-material/Add";
import {
  ICreateScoreRequest,
  ICreateTeamScore,
  IExtendedRosterResponse,
  IMatchupResponseWithResults,
  IMatchupResponseWithResultsAndScores,
  IRosterResponse,
} from "@tournament-app/types";
import { useUpdateMatchScore } from "api/client/hooks/matchups/useUpdateMatchupScore";
import { clsx } from "clsx";
import Button from "components/button";
import CheckboxGroup from "components/checkboxGroup";
import Chip from "components/chip";
import Dialog from "components/dialog";
import { useEffect, useState } from "react";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import AddMatchResult from "views/addMatchResult";
import styles from "./manageMatchupForm.module.scss";

export default function ManageMatchupForm2({
  onClose,
  id,
  matchup,
}: {
  onClose?: () => void;
  id?: number;
  matchup?: IMatchupResponseWithResults;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const [scores, setScores] = useState<ICreateScoreRequest[]>([]);

  const [addMatchModalOpen, setAddMatchModalOpen] = useState<boolean>(false);

  const [winners, setWinners] = useState<boolean[]>(
    matchup?.results ? new Array(matchup?.results.length).fill(false) : []
  );

  const rosters = matchup?.results.map((res) => res.roster);

  const createScoreMutation = useUpdateMatchScore();

  const submit = async () => {
    if (!matchup || !scores) return;

    const results = [];
    for (let i = 0; i < winners.length; i++) {
      results.push({ isWinner: winners[i], rosterId: matchup.results[i].id });
    }

    await createScoreMutation.mutateAsync({
      id,
      data: { scores, results },
    });
    onClose && onClose();
  };

  return (
    <div className={styles.innerFormWrapper}>
      {rosters && (rosters.length ?? 0) > 1 && (
        <Dialog
          onClose={() => setAddMatchModalOpen(false)}
          active={addMatchModalOpen}
          variant={theme}
          className={styles.dialog}
        >
          <AddMatchResult
            setScores={setScores}
            onClose={() => setAddMatchModalOpen(false)}
            rosters={rosters}
          />
        </Dialog>
      )}
      <h3 className={clsx(globals[`${textColorTheme}Color`], styles.title)}>
        matchup result
      </h3>

      <div className={styles.contentWrapper}>
        <div className={styles.versusLayout}>
          {rosters?.map((roster, index) => {
            return (
              <>
                <div className={styles.userCards}>
                  <Chip
                    label={
                      roster?.participation?.group?.name ??
                      roster?.participation?.user?.username
                    }
                    variant="primary"
                  />
                  {(roster?.players ?? []).map((player) => {
                    return (
                      <div
                        className={clsx(
                          styles.userCard,
                          globals[`${textColorTheme}BackgroundColor`]
                        )}
                      >
                        <img
                          src={
                            player.user.profilePicture ?? "/profilePicture.png"
                          }
                          onError={(e) =>
                            (e.currentTarget.src = "/profilePicture.png")
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
                {index + 1 < rosters.length && (
                  <p className={globals[`${textColorTheme}Color`]}>vs</p>
                )}
              </>
            );
          })}
        </div>
        <div className={styles.matchesLabel}>
          <p className={clsx(globals.label, globals[`${textColorTheme}Color`])}>
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
              <div
                className={clsx(
                  styles.resultsCard,
                  globals[`${textColorTheme}BackgroundColor`]
                )}
              >
                <p className={globals[`${theme}Color`]}>{score.roundNumber}.</p>
                <div className={styles.scores}>
                  <div
                    className={clsx(
                      styles.score,
                      globals.lightColor,
                      score?.scores?.[0].isWinner
                        ? globals.primaryBackgroundColor
                        : globals.dangerBackgroundColor
                    )}
                  >
                    {rosters
                      ?.filter(
                        (elem) => elem.id === score?.scores?.[0].rosterId
                      )
                      .map((roster) => {
                        return (
                          roster?.participation?.group?.name ??
                          roster?.participation?.user?.username ??
                          ""
                        );
                      })}{" "}
                    ({score?.scores?.[0].points})
                  </div>
                  <p className={globals[`${theme}Color`]}>-</p>
                  <div
                    className={clsx(
                      styles.score,
                      globals.lightColor,
                      score?.scores?.[1].isWinner
                        ? globals.primaryBackgroundColor
                        : globals.dangerBackgroundColor
                    )}
                  >
                    {rosters
                      ?.filter(
                        (elem) => elem.id === score?.scores?.[1].rosterId
                      )
                      .map((roster) => {
                        return (
                          roster?.participation?.group?.name ??
                          roster?.participation?.user?.username ??
                          ""
                        );
                      })}{" "}
                    ({score?.scores?.[1].points})
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div>
          <p className={clsx(globals.label, globals[`${textColorTheme}Color`])}>
            winner/s
          </p>
          <CheckboxGroup
            checkboxes={
              rosters?.map((roster, index) => {
                return {
                  variant: textColorTheme,
                  labelVariant: textColorTheme,
                  label:
                    roster?.participation?.group?.name ??
                    roster?.participation?.user?.username ??
                    "",
                  id: roster?.id?.toString(),
                  onSelect: () => {
                    setWinners((prev) => {
                      prev[index] = !prev[index];
                      return prev;
                    });
                  },
                };
              }) ?? []
            }
          />
        </div>
        <Button variant="primary" label="end matchup" onClick={submit} />
      </div>
    </div>
  );
}
