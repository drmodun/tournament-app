"use client";

import AddIcon from "@mui/icons-material/Add";
import {
  ICreateScoreRequest,
  IExtendedRosterResponse,
  IRosterResponse,
} from "@tournament-app/types";
import { clsx } from "clsx";
import Button from "components/button";
import Dialog from "components/dialog";
import Dropdown from "components/dropdown";
import Input from "components/input";
import SlideButton from "components/slideButton";
import { useEffect, useState } from "react";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import AddMatchResult from "views/addMatchResult";
import styles from "./manageMatchupForm.module.scss";
import CheckboxGroup from "components/checkboxGroup";
import { useUpdateMatchScore } from "api/client/hooks/matchups/useUpdateMatchupScore";
import { useGetStage } from "api/client/hooks/stages/useGetStage";
import Chip from "components/chip";

export default function ManageMatchupForm({
  onClose,
  rosters,
  id,
}: {
  onClose?: () => void;
  rosters?: (IRosterResponse | IExtendedRosterResponse)[];
  id?: number;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const [scores, setScores] = useState<ICreateScoreRequest[]>([]);

  const [addMatchModalOpen, setAddMatchModalOpen] = useState<boolean>(false);

  const [winners, setWinners] = useState<boolean[]>(
    rosters ? new Array(rosters.length).fill(false) : [],
  );

  const createScoreMutation = useUpdateMatchScore();

  const submit = async () => {
    if (!rosters || !scores) return;

    const results = [];
    for (let i = 0; i < winners.length; i++) {
      results.push({ isWinner: winners[i], rosterId: rosters[i].id });
    }

    await createScoreMutation.mutateAsync({
      id,
      data: { scores, results },
    });
    onClose && onClose();
  };

  return (
    <div className={styles.innerFormWrapper}>
      {rosters && (rosters?.length ?? 0) > 1 && (
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
                  globals[`${textColorTheme}BackgroundColor`],
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
                        : globals.dangerBackgroundColor,
                    )}
                  >
                    {rosters
                      ?.filter(
                        (elem) => elem.id === score?.scores?.[0].rosterId,
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
                        : globals.dangerBackgroundColor,
                    )}
                  >
                    {rosters
                      ?.filter(
                        (elem) => elem.id === score?.scores?.[1].rosterId,
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
