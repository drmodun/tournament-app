"use client";

import AddIcon from "@mui/icons-material/Add";
import { IExtendedUserResponse } from "@tournament-app/types";
import { useAuth } from "api/client/hooks/auth/useAuth";
import { useGetUserOrganizedCompetitions } from "api/client/hooks/competitions/useGetUserOrganizedCompetitions";
import { clsx } from "clsx";
import CardExpanded from "components/cardExpanded";
import Dialog from "components/dialog";
import ProgressWheel from "components/progressWheel";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import CreateTournamentForm from "views/createTournamentForm";
import styles from "./manageCompetitions.module.scss";

export default function ManageCompetitions({
  user,
}: {
  user: IExtendedUserResponse;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const { isLoading, data } = useGetUserOrganizedCompetitions();
  const { isLoading: isLoadingUser, data: userData } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    if (!isLoadingUser && !userData) router.push("/login");
  }, [isLoadingUser, userData]);

  return (
    <div
      className={clsx(
        styles.wrapper,
        globals[`${textColorTheme}BackgroundColor`]
      )}
    >
      <Dialog
        variant={theme}
        active={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        className={styles.dialog}
      >
        <CreateTournamentForm
          userId={user?.id}
          onClose={() => setIsAddDialogOpen(false)}
        />
      </Dialog>
      <div className={styles.competitionsTitle}>
        <b className={clsx(globals[`${theme}Color`])}>your competitions</b>
        <button
          title="add competition"
          className={styles.addButton}
          onClick={() => setIsAddDialogOpen(true)}
        >
          <AddIcon className={styles[`${theme}Fill`]} />
        </button>
      </div>
      {isLoading ? (
        <ProgressWheel variant={textColorTheme} />
      ) : (
        <div className={styles.competitionsWrapper}>
          <div className={styles.competitions}>
            {data?.results.map((card, index) => (
              <CardExpanded
                key={index}
                image={card.logo}
                label={card.name}
                startDate={new Date(card?.startDate.toString()).getTime()}
                endDate={new Date(card?.endDate.toString()).getTime()}
                category={card.category.name}
                participants={card.currentParticipants}
                location={card?.location}
                locationDetails={card.location}
                variant={theme}
                id={card.id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
