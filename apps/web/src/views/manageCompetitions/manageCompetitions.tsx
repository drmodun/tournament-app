"use client";

import styles from "./manageCompetitions.module.scss";
import globals from "styles/globals.module.scss";
import { clsx } from "clsx";
import Dialog from "components/dialog";
import Input from "components/input";
import { useEffect, useState } from "react";
import { useThemeContext } from "utils/hooks/useThemeContext";
import CheckboxGroup from "components/checkboxGroup";
import { textColor } from "types/styleTypes";
import AddIcon from "@mui/icons-material/Add";
import Dropdown from "components/dropdown";
import { CardExpandedProps } from "components/cardExpanded/cardExpanded";
import CardExpanded from "components/cardExpanded";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import Button from "components/button";
import SlideButton from "components/slideButton";
import { IExtendedUserResponse, IUserResponse } from "@tournament-app/types";
import { useGetUserOrganizedCompetitions } from "api/client/hooks/competitions/useGetUserOrganizedCompetitions";
import ProgressWheel from "components/progressWheel";
import CreateTournamentForm from "views/createTournamentForm";
import { useRouter } from "next/navigation";
import { useAuth } from "api/client/hooks/auth/useAuth";
import { useGetGroup } from "api/client/hooks/groups/useGetGroup";
import { useUserGroups } from "api/client/hooks/groups/useUserGroups";

type CompetitionInputs = {
  name: string;
  category: string;
  type: string;
  teamCompetition: boolean;
  public: boolean;
  eloConstraint: boolean;
  location: "online" | "offline" | "hybrid";
  locationDetails?: string;
  eloRange?: [number, number];
  leagueFormat?: boolean;
};

type EditCompetitionInputs = {
  name?: string;
  category?: string;
  type?: string;
  teamCompetition?: boolean;
  public?: boolean;
  eloConstraint?: boolean;
  location?: "online" | "offline" | "hybrid";
  locationDetails?: string;
  eloRange?: [number, number];
  leagueFormat?: boolean;
};

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
        globals[`${textColorTheme}BackgroundColor`],
      )}
    >
      <Dialog
        variant={theme}
        active={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        className={styles.dialog}
      >
        <CreateTournamentForm userId={user?.id} />
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
