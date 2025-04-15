"use client";

import { IStageResponseWithChallongeTournament } from "@tournament-app/types";
import { clsx } from "clsx";
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
import { useEffect } from "react";

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
  stage,
}: {
  stage?: IStageResponseWithChallongeTournament;
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
      {stage?.challongeTournamentId ? (
        <iframe
          src={`https://challonge.com/${stage?.challongeTournamentId}/module?theme=8396&show_standings=1&multiplier=1.75`}
          width="100%"
          height="500"
          style={{ border: "none" }}
          allowTransparency={true}
        />
      ) : (
        <p className={`${globals[`${theme}Color`]}`}>no bracket data</p>
      )}
    </div>
  );
}
