"use client";

import {
  ICreateMatchResult,
  ICreateScoreRequest,
  IRosterResponse,
} from "@tournament-app/types";
import { clsx } from "clsx";
import Button from "components/button";
import Dropdown from "components/dropdown";
import Input from "components/input";
import SlideButton from "components/slideButton";
import { Dispatch, SetStateAction, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { useToastContext } from "utils/hooks/useToastContext";
import styles from "./addMatchResult.module.scss";

export default function AddMatchResult({
  onClose,
  setScores,
  rosters,
}: {
  onClose?: () => void;
  setScores?: Dispatch<SetStateAction<ICreateScoreRequest[]>>;
  rosters: IRosterResponse[];
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const { addToast } = useToastContext();

  const methods = useForm<ICreateMatchResult>();
  const onSubmit = async () => {
    if ((rosters?.[0] ?? 0) && (rosters?.[1] ?? 0) && result1 && result2) {
      setScores &&
        setScores((prev) => [
          ...prev,
          {
            roundNumber: prev.length + 1,
            scores: [
              {
                isWinner: winnerFirst,
                rosterId: roster1?.id ?? 0,
                points: result1,
              },
              {
                isWinner: !winnerFirst,
                rosterId: roster2?.id ?? 0,
                points: result2,
              },
            ],
          },
        ]);
      onClose && onClose();
    } else {
      addToast("please check values!", "error");
    }
  };

  const [roster1, setRoster1] = useState<IRosterResponse>();
  const [roster2, setRoster2] = useState<IRosterResponse>();

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

        <Dropdown
          placeholder="select roster"
          defaultValue={
            rosters.length == 2
              ? rosters[0]?.participation?.group?.name ??
                rosters[0]?.participation?.user?.username ??
                undefined
              : undefined
          }
          onSelect={(index: number) => {
            rosters && setRoster1(rosters[index]);
          }}
          options={rosters.map((roster) => {
            return {
              label:
                roster?.participation?.group?.name ??
                roster?.participation?.user?.username ??
                "",
              id: roster?.id,
            };
          })}
        />
        <Dropdown
          placeholder="select roster"
          onSelect={(index: number) => {
            rosters && setRoster2(rosters[index]);
          }}
          defaultValue={
            rosters.length == 2
              ? rosters[1]?.participation?.group?.name ??
                rosters[1]?.participation?.user?.username ??
                undefined
              : undefined
          }
          options={rosters.map((roster) => {
            return {
              label:
                roster?.participation?.group?.name ??
                roster?.participation?.user?.username ??
                "",
              id: roster?.id,
            };
          })}
        />

        {roster1 && roster2 && roster1.id !== roster2.id && (
          <div className={styles.contentWrapper}>
            <div className={styles.teamWrapper}>
              <div className={styles.teamPlayers}>
                {roster1?.players.map((player) => (
                  <div
                    key={player.user.id}
                    className={clsx(
                      styles.userCard,
                      globals[`${textColorTheme}BackgroundColor`],
                    )}
                  >
                    <img
                      src={player.user.profilePicture ?? "/profilePicture.png"}
                      onError={(e) =>
                        (e.currentTarget.src = "/profilePicture.png")
                      }
                      className={styles.userPfp}
                    />
                    <p className={globals[`${theme}Color`]}>
                      {player.user.username}
                    </p>
                  </div>
                ))}
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
                {roster2?.players.map((player) => (
                  <div
                    key={player.user.id}
                    className={clsx(
                      styles.userCard,
                      globals[`${textColorTheme}BackgroundColor`],
                    )}
                  >
                    <img
                      src={player.user.profilePicture ?? "/profilePicture.png"}
                      onError={(e) =>
                        (e.currentTarget.src = "/profilePicture.png")
                      }
                      className={styles.userPfp}
                    />
                    <p className={globals[`${theme}Color`]}>
                      {player.user.username}
                    </p>
                  </div>
                ))}
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
