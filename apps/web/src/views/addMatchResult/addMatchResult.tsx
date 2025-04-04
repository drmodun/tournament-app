"use client";

import { ICreateMatchResult, ICreateTeamScore } from "@tournament-app/types";
import { useGetRoster } from "api/client/hooks/rosters/useGetRoster";
import { clsx } from "clsx";
import Button from "components/button";
import Input from "components/input";
import ProgressWheel from "components/progressWheel";
import SlideButton from "components/slideButton";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import styles from "./addMatchResult.module.scss";

export default function AddMatchResult({ onClose }: { onClose?: () => void }) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const methods = useForm<ICreateMatchResult>();
  const onSubmit = async (data: ICreateMatchResult) => {
    data.scores;
    onClose && onClose();
  };

  const [teams, setTeams] = useState<Partial<ICreateTeamScore>[]>([
    { rosterId: 1 },
    { rosterId: 2 },
  ]);

  const { data: team1, isLoading: isLoading1 } = useGetRoster(
    teams?.[0]?.rosterId ?? -1,
  );
  const { data: team2, isLoading: isLoading2 } = useGetRoster(
    teams?.[1]?.rosterId ?? -1,
  );

  const [result1, setResult1] = useState<number>();
  const [result2, setResult2] = useState<number>();

  const [winnerFirst, setWinnerFirst] = useState<boolean>(true);

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className={styles.innerFormWrapper}
      >
        <h3 className={clsx(globals[`${textColorTheme}Color`], styles.title)}>
          create match result
        </h3>
        {isLoading1 || isLoading2 ? (
          <div>
            <ProgressWheel variant={textColorTheme} />
          </div>
        ) : (
          <div className={styles.contentWrapper}>
            <div className={styles.teamWrapper}>
              <div className={styles.teamPlayers}>
                {team1?.players.map((player) => {
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
              <Input
                placeholder="enter score"
                type="number"
                variant={textColorTheme}
                onChange={(e) => setResult1(e.currentTarget.valueAsNumber)}
              />
            </div>

            <div className={styles.teamWrapper}>
              <div className={styles.teamPlayers}>
                {team2?.players.map((player) => {
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
              <Input
                placeholder="enter score"
                type="number"
                variant={textColorTheme}
                onChange={(e) => setResult2(e.currentTarget.valueAsNumber)}
              />
            </div>

            <div>
              <p
                className={clsx(
                  globals[`${textColorTheme}Color`],
                  globals.label,
                )}
              >
                select winner
              </p>
              <SlideButton
                options={["1", "2"]}
                onChange={(val: string) => setWinnerFirst(val === "1")}
                label="select winner"
              />
            </div>

            <Button
              variant="primary"
              label="create match result"
              className={styles.submitLfpButton}
              submit={true}
            />
          </div>
        )}
      </form>
    </FormProvider>
  );
}
