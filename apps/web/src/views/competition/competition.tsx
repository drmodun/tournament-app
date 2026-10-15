"use client";

import {
  groupRoleEnum,
  IExtendedTournamentResponse,
  tournamentTeamTypeEnum,
} from "@tournament-app/types";
import { useAuth } from "api/client/hooks/auth/useAuth";
import { useDeleteCompetition } from "api/client/hooks/competitions/useDeleteCompetition";
import { useCheckIfGroupMember } from "api/client/hooks/groups/useCheckIfGroupMember";
import { useCheckIfUserIsParticipating } from "api/client/hooks/participations/useCheckIfUserIsParticipating";
import { useCreateSoloParticipation } from "api/client/hooks/participations/useCreateSoloParticipation";
import { useGetUserGroupParticipations } from "api/client/hooks/participations/useGetUserGroupParticipations";
import Button from "components/button";
import Chip from "components/chip";
import Dialog from "components/dialog";
import ProgressWheel from "components/progressWheel";
import getUnicodeFlagIcon from "country-flag-icons/unicode";
import Link from "next/link";
import { useState } from "react";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import {
  COUNTRY_NAMES_TO_CODES,
  formatDateTime,
} from "utils/mixins/formatting";
import EditCompetitionForm from "views/editCompetitionForm";
import GroupSelectDialog from "views/groupSelectDialog";
import DetailPage, { SidebarSection } from "components/detailPage";
import styles from "./competition.module.scss";

export default function Competition({
  competition,
}: {
  competition: IExtendedTournamentResponse;
}) {
  const { data, isLoading } = useAuth();
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const { data: groupMembershipData, isLoading: groupMembershipIsLoading } =
    useCheckIfGroupMember(competition?.affiliatedGroup?.id ?? -1);

  const deleteCompetitionMutation = useDeleteCompetition();
  const soloJoinCompetitionMutation = useCreateSoloParticipation();
  const { data: participationData } = useCheckIfUserIsParticipating(
    competition?.id,
    data?.id,
  );
  const { data: groupParticipationData } = useGetUserGroupParticipations(
    competition?.id,
  );

  const [groupSelectModalOpen, setGroupSelectModalOpen] =
    useState<boolean>(false);

  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);

  return (
    <DetailPage
      logo={competition?.logo}
      title={competition?.name}
      subtitle={competition?.creator?.username}
      description={competition?.description}
      spacedSidebar
      dialogs={
        <>
          <Dialog
            active={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            variant={theme}
            className={styles.dialog}
          >
            <EditCompetitionForm
              competition={competition}
              onClose={() => setEditModalOpen(false)}
            />
          </Dialog>
          <Dialog
            active={groupSelectModalOpen}
            onClose={() => setGroupSelectModalOpen(false)}
            variant={theme}
            className={styles.dialog}
          >
            <GroupSelectDialog competitionId={competition?.id} />
          </Dialog>
        </>
      }
      sidebar={
        <>
          {competition?.startDate && competition?.endDate && (
            <SidebarSection name="date">
              <div className={styles.dates}>
                <Chip
                  label={formatDateTime(competition?.startDate)}
                  variant={textColorTheme}
                />
                <p>-</p>
                <Chip
                  label={formatDateTime(competition?.endDate)}
                  variant={textColorTheme}
                />
              </div>
            </SidebarSection>
          )}
          {(competition?.actualLocation?.name || competition?.location) && (
            <SidebarSection name="location">
              <Chip
                label={
                  competition?.actualLocation?.name != undefined
                    ? competition?.actualLocation?.name
                    : competition?.location
                }
              ></Chip>
            </SidebarSection>
          )}
          {competition?.country && (
            <SidebarSection name="country">
              <Chip
                label={`${competition?.country} ${getUnicodeFlagIcon(COUNTRY_NAMES_TO_CODES[competition?.country ?? "Unknown"] ?? "ZZ")}`}
              ></Chip>
            </SidebarSection>
          )}
          {competition?.minimumMMR !== undefined &&
            competition?.maximumMMR !== undefined && (
              <SidebarSection name="mmr">
                <div className={styles.dates}>
                  <Chip
                    label={competition?.minimumMMR?.toString()}
                    variant={textColorTheme}
                  ></Chip>
                  <p className={globals[`${textColorTheme}Color`]}>-</p>
                  <Chip
                    label={competition?.maximumMMR?.toString()}
                    variant={textColorTheme}
                  ></Chip>
                </div>
              </SidebarSection>
            )}
          {competition?.type && (
            <SidebarSection name="type">
              <Chip label={competition?.type}></Chip>
            </SidebarSection>
          )}
          {competition?.category && (
            <SidebarSection name="category">
              <Chip label={competition?.category?.name}></Chip>
            </SidebarSection>
          )}
        </>
      }
      actions={
        <>
          {groupMembershipIsLoading || isLoading ? (
            <ProgressWheel variant={textColorTheme} />
          ) : (
            data &&
            (groupMembershipData?.role === groupRoleEnum.ADMIN ||
            groupMembershipData?.role === groupRoleEnum.OWNER ||
            competition?.creator?.id == data?.id ? (
              <div className={styles.manageCompetitionButtonsWrapper}>
                <Button
                  variant="warning"
                  label="edit competition"
                  onClick={() => setEditModalOpen(true)}
                />
                <Button
                  variant="danger"
                  label="delete competition"
                  onClick={() =>
                    deleteCompetitionMutation.mutate(competition.id)
                  }
                />
                <Link
                  href={`/manageStages/${competition?.id}`}
                  className={styles.linkStage}
                >
                  <Button variant={textColorTheme} label="view stages" />
                </Link>
              </div>
            ) : (participationData?.results?.length ?? -1) > 0 ||
              !competition?.isPublic ||
              (groupParticipationData?.length ?? -1) > 0 ? (
              <div className={styles.manageCompetitionButtonsWrapper}>
                <Link
                  href={`/stages/${competition?.id}`}
                  className={styles.linkStage}
                >
                  <Button variant={textColorTheme} label="view stages" />
                </Link>
              </div>
            ) : (
              <div className={styles.manageCompetitionButtonsWrapper}>
                {competition.teamType !== tournamentTeamTypeEnum.TEAM && (
                  <Button
                    variant="primary"
                    label="join competition"
                    onClick={() =>
                      soloJoinCompetitionMutation.mutate(competition?.id)
                    }
                  />
                )}
                {competition.teamType !== tournamentTeamTypeEnum.SOLO && (
                  <Button
                    variant="primary"
                    label="join competition with group"
                    onClick={() => setGroupSelectModalOpen(true)}
                  />
                )}
                <Link
                  href={`/stages/${competition?.id}`}
                  className={styles.linkStage}
                >
                  <Button variant={textColorTheme} label="view stages" />
                </Link>
              </div>
            ))
          )}
        </>
      }
    />
  );
}
