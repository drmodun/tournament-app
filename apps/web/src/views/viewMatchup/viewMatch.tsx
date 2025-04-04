"use client";

import { IRosterResponse, matchupTypeEnum } from "@tournament-app/types";
import { clsx } from "clsx";
import Chip from "components/chip";
import { useState } from "react";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { formatDateTime } from "utils/mixins/formatting";
import styles from "./viewMatch.module.scss";
import Button from "components/button";

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

export default function ViewMatch(
  {
    //matchup,
  }: {
    //matchup?: IMatchupResponseWithRosters;
  },
) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const [matchup, setMatchup] = useState<IMatchupResponseWithRosters>({
    id: 1,
    stageId: -1,
    startDate: new Date(),
    isFinished: false,
    roundId: 2,
    matchupType: "a",
    rosters: [
      {
        players: [
          {
            user: {
              id: 1,
              username: "my username1",
              isFake: false,
              profilePicture:
                "https://img.freepik.com/free-photo/close-up-gerbera-flowers-high-view_23-2148268296.jpg",
              country: "Angola",
            },
            isSubstitute: false,
            career: [],
          },
          {
            user: {
              id: 1,
              username: "my username2",
              isFake: false,
              profilePicture:
                "https://img.freepik.com/free-photo/close-up-gerbera-flowers-high-view_23-2148268296.jpg",
              country: "Angola",
            },
            isSubstitute: false,
            career: [],
          },
        ],
        createdAt: new Date(),
        id: 1,
        stageId: 1,
        participationId: 1,
        group: {
          logo: "https://img.freepik.com/free-photo/close-up-gerbera-flowers-high-view_23-2148268296.jpg",
          id: 1,
          name: "this is the test group",
          abbreviation: "tst",
        },
        user: {
          id: 1,
          username: "my username1",
          isFake: false,
          profilePicture:
            "https://img.freepik.com/free-photo/close-up-gerbera-flowers-high-view_23-2148268296.jpg",
        },
        participation: {
          id: 1,
          tournament: {
            categoryId: 1,
          },
          group: {
            id: 1,
            name: "this is the test group1",
            abbreviation: "tst1",
          },
          user: {
            id: 1,
            name: "this is the test group2",
            abbreviation: "tst2",
          },
        },
      },
      {
        players: [
          {
            user: {
              id: 1,
              username: "my username1",
              isFake: false,
              profilePicture: "",
              country: "Angola",
            },
            isSubstitute: false,
            career: [],
          },
          {
            user: {
              id: 1,
              username: "my username2",
              isFake: false,
              profilePicture: "",
              country: "Angola",
            },
            isSubstitute: false,
            career: [],
          },
        ],
        createdAt: new Date(),
        id: 1,
        stageId: 1,
        participationId: 1,
        group: {
          logo: "https://img.freepik.com/free-photo/close-up-gerbera-flowers-high-view_23-2148268296.jpg",
          id: 1,
          name: "this is the test group",
          abbreviation: "tst",
        },
        user: {
          id: 1,
          username: "my username1",
          isFake: false,
          profilePicture:
            "https://img.freepik.com/free-photo/close-up-gerbera-flowers-high-view_23-2148268296.jpg",
        },
        participation: {
          id: 1,
          tournament: {
            categoryId: 1,
          },
          group: {
            id: 1,
            name: "this is the test group1",
            abbreviation: "tst1",
          },
          user: {
            id: 1,
            name: "this is the test group2",
            abbreviation: "tst2",
          },
        },
      },
    ],
  });

  return (
    <div
      className={clsx(
        styles.wrapper,
        globals[`${textColorTheme}BackgroundColor`],
      )}
    >
      <h3>manage match</h3>

      <div>
        {matchup.rosters.map((roster, index) => {
          return (
            <div className={styles.versusWrapper}>
              <div className={styles.rosterWrapper}>
                <img
                  src={roster.group?.logo ?? roster.user?.profilePicture}
                  className={styles.userPfp}
                />
                <p className={globals[`${theme}Color`]}>
                  {roster.group?.name ?? roster.user?.username}
                </p>
              </div>
              {index % 2 == 0 && matchup.rosters.length >= index + 1 && (
                <p className={globals[`${theme}Color`]}>vs</p>
              )}
            </div>
          );
        })}
      </div>
      <div>
        <p className={clsx(globals.label, globals[`${theme}Color`])}>rosters</p>
        <div className={styles.rostersWrapper}>
          {matchup.rosters.map((roster, index) => {
            return (
              <div
                className={clsx(
                  styles.roster,
                  globals[`${theme}BackgroundColor`],
                )}
              >
                <b className={globals[`${textColorTheme}Color`]}>
                  {roster.group?.name ?? roster.user?.username}
                </b>
                <div className={styles.players}>
                  {roster.players.map((player) => {
                    return (
                      <div className={styles.rosterWrapper}>
                        <img
                          className={styles.userPfp}
                          src={player.user.profilePicture}
                          onError={(e) =>
                            (e.currentTarget.src = "/profilePicture.png")
                          }
                        />
                        <p className={globals[`${textColorTheme}Color`]}>
                          {player.user.username}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <div className={styles.infoWrapper}>
          <p className={clsx(globals.label, globals[`${theme}Color`])}>state</p>
          <b className={clsx(globals.label, globals[`${theme}Color`])}>
            {matchup.isFinished ? "finished" : "active"}
          </b>
        </div>
        <div className={styles.infoWrapper}>
          <p className={clsx(globals.label, globals[`${theme}Color`])}>
            starting date
          </p>
          <b className={clsx(globals.label, globals[`${theme}Color`])}>
            {formatDateTime(matchup.startDate)}
          </b>
        </div>
        <div className={styles.infoWrapper}>
          <p className={clsx(globals.label, globals[`${theme}Color`])}>type</p>
          <b className={clsx(globals.label, globals[`${theme}Color`])}>
            {matchup.matchupType === matchupTypeEnum.FFA
              ? "free for all (ffa)"
              : "1v1"}
          </b>
        </div>
      </div>
      <div className={styles.actionButtons}>
        <Button variant="warning" label="edit"></Button>
        <Button variant="danger" label="delete"></Button>
      </div>
    </div>
  );
}
