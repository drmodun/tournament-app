"use client";

import { IRosterResponse, matchupTypeEnum } from "@tournament-app/types";
import { clsx } from "clsx";
import Chip from "components/chip";
import { useState } from "react";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { formatDateTime } from "utils/mixins/formatting";
import styles from "./manageMatchups.module.scss";

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

export default function ManageMatchups({ stageId }: { stageId?: number }) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const [matchups, setMatchups] = useState<IMatchupResponseWithRosters[]>([
    {
      id: 1,
      stageId: stageId ?? -1,
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
    },
    {
      id: 1,
      stageId: stageId ?? -1,
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
                username: "my username 3",
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
                username: "my username 4",
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
            username: "my username2",
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
              name: "this is the test group3",
              abbreviation: "tst3",
            },
            user: {
              id: 1,
              name: "this is the test group4",
              abbreviation: "tst4",
            },
          },
        },
        {
          players: [
            {
              user: {
                id: 1,
                username: "my username 3",
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
                username: "my username 4",
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
            username: "my username2",
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
              name: "this is the test group3",
              abbreviation: "tst3",
            },
            user: {
              id: 1,
              name: "this is the test group4",
              abbreviation: "tst4",
            },
          },
        },
      ],
    },
  ]);

  return (
    <div
      className={clsx(
        styles.wrapper,
        globals[`${textColorTheme}BackgroundColor`],
      )}
    >
      <h3>manage matchups</h3>

      {matchups.map((matchup) => {
        return <MatchupCard matchup={matchup} />;
      })}
    </div>
  );
}

const MatchupCard = ({ matchup }: { matchup: IMatchupResponseWithRosters }) => {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  return (
    <div className={styles.matchupWrapper}>
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
      <div className={styles.details}>
        {matchup.startDate && (
          <Chip variant="secondary" label={formatDateTime(matchup.startDate)} />
        )}
        {matchup.matchupType && (
          <Chip
            variant="secondary"
            label={
              matchup.matchupType === matchupTypeEnum.ONE_VS_ONE
                ? "1v1"
                : "free for all"
            }
          />
        )}
        {matchup.isFinished && <Chip label="finished" variant="danger" />}
      </div>
    </div>
  );
};
