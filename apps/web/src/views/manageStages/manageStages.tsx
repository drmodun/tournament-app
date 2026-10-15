"use client";

import Dialog from "components/dialog";
import StageList from "components/stageList";
import { useState } from "react";
import { useThemeContext } from "utils/hooks/useThemeContext";
import AddStageForm from "views/addStageForm";

export default function ManageStages({
  tournamentId,
}: {
  tournamentId?: number;
}) {
  const { theme } = useThemeContext();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  return (
    <StageList
      tournamentId={tournamentId}
      title="manage your stages"
      emptyText="you have no stages!"
      onAdd={() => setDialogOpen(true)}
    >
      <Dialog
        variant={theme}
        active={dialogOpen}
        onClose={() => setDialogOpen(false)}
      >
        <AddStageForm
          tournamentId={tournamentId}
          onClose={() => setDialogOpen(false)}
        />
      </Dialog>
    </StageList>
  );
}
