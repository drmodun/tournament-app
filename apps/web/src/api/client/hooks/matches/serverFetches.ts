"use server";

import {
  IMatchupResponseWithResults,
  IStageStandingsResponse,
} from "@tournament-app/types";
import { serverApiUrl } from "api/serverApiUrl";
import { revalidatePath } from "next/cache";

const RESULTS_PAGE_SIZE = 100; // the API's page limit
const MAX_RESULTS_PAGES = 50;

const fetchStageResultsPage = async (
  stageId: number,
  page: number,
): Promise<IMatchupResponseWithResults[]> =>
  fetch(
    `${serverApiUrl}/matches/results?stageId=${stageId}&pageSize=${RESULTS_PAGE_SIZE}&page=${page}`,
    {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    },
  ).then((res) => (res.ok ? res.json() : []));

// Every matchup of a stage with its rosters and winners, page by page
export const fetchStageResults = async (
  stageId: number,
): Promise<IMatchupResponseWithResults[]> => {
  const matchups: IMatchupResponseWithResults[] = [];

  for (let page = 1; page <= MAX_RESULTS_PAGES; page++) {
    const results = await fetchStageResultsPage(stageId, page);
    matchups.push(...results);

    if (results.length < RESULTS_PAGE_SIZE) {
      break;
    }
  }

  return matchups;
};

// Standings of a stage run by the API, in its format
export const fetchStageStandings = async (
  stageId: number,
): Promise<IStageStandingsResponse | null> =>
  fetch(`${serverApiUrl}/matches/stage/${stageId}/standings`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  }).then((res) => (res.ok ? res.json() : null));

export const invalidateMatches = async () => {
  revalidatePath("/manageMatchup");
  revalidatePath("/match");
  revalidatePath("/manageUserManagedMatchups");
};
