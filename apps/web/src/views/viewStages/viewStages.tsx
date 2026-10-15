"use client";

import { IExtendedTournamentResponse } from "@tournament-app/types";
import StageList from "components/stageList";

export default function ViewStages({
  tournament,
}: {
  tournament?: IExtendedTournamentResponse;
}) {
  return (
    <StageList
      tournamentId={tournament?.id}
      title={`stages ${tournament ? `for ${tournament.name}` : ""}`}
      emptyText="there are no stages!"
    />
  );
}
