"use client";

import { clsx } from "clsx";
import { Bracket } from "react-brackets";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import styles from "./bracket.module.scss";
import { useGetCompetition } from "api/client/hooks/competitions/useGetCompetition";
import {
  IExtendedStageResponseWithTournament,
  IStageResponse,
  IStageResponseWithTournament,
} from "@tournament-app/types";
import { useCheckIfGroupMember } from "api/client/hooks/groups/useCheckIfGroupMember";

interface TournamentBracketProps {
  stageId: number;
}

interface ReactBracketsTeam {
  id?: number;
  name: string;
  score?: string;
}

interface ReactBracketsSeed {
  id: string | number;
  date: string;
  teams: [ReactBracketsTeam, ReactBracketsTeam];
  winner?: number;
  score?: string;
}

interface ReactBracketsRound {
  title: string;
  seeds: ReactBracketsSeed[];
}

export interface ReactBracketsData {
  stageId: number;
  stageName: string;
  rounds: ReactBracketsRound[];
}

export default function BracketView({
  bracket,
  stage,
}: {
  bracket: ReactBracketsData;
  stage?: IExtendedStageResponseWithTournament;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  return (
    <div
      className={clsx(
        styles.wrapper,
        globals[`${textColorTheme}BackgroundColor`],
      )}
    >
      {bracket?.rounds?.length > 0 ? (
        <Bracket
          rounds={bracket.rounds}
          roundClassName={`${theme}Matchup`}
          bracketClassName={globals[`${theme}Color`]}
        />
      ) : (
        <p className={`${globals[`${theme}Color`]}`}>No bracket data</p>
      )}
    </div>
  );
}
