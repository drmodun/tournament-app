"use client";

import styles from "./competition.module.scss";
import globals from "styles/globals.module.scss";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { textColor } from "types/styleTypes";
import { clsx } from "clsx";
import Button from "components/button";
import Chip from "components/chip";
import {
  COUNTRY_NAMES_TO_CODES,
  formatDateTime,
} from "utils/mixins/formatting";
import Markdown from "react-markdown";
import getUnicodeFlagIcon from "country-flag-icons/unicode";
import {
  groupRoleEnum,
  IExtendedTournamentResponse,
} from "@tournament-app/types";
import { useAuth } from "api/client/hooks/auth/useAuth";
import { useRouter } from "next/navigation";
import rehypeRaw from "rehype-raw";
import { useEffect, useState } from "react";
import { useCheckIfGroupMember } from "api/client/hooks/groups/useCheckIfGroupMember";
import ProgressWheel from "components/progressWheel";
import EditCompetitionForm from "views/editCompetitionForm";
import Dialog from "components/dialog";
import { useDeleteCompetition } from "api/client/hooks/competitions/useDeleteCompetition";

type SidebarSectionProps = {
  name: string;
  children?: React.ReactNode;
};

export default function Competition({
  competition,
}: {
  competition: IExtendedTournamentResponse;
}) {
  const { data, isLoading, isSuccess } = useAuth();
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const { data: groupMembershipData, isLoading: groupMembershipIsLoading } =
    useCheckIfGroupMember(competition?.affiliatedGroup?.id);

  const deleteCompetitionMutation = useDeleteCompetition();

  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);

  return (
    <div className={clsx(styles.wrapper)}>
      <Dialog
        active={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        variant={theme}
      >
        <EditCompetitionForm competition={competition} />
      </Dialog>
      <div className={clsx(styles.left)}>
        <div className={clsx(styles.banner)}>
          <div className={styles.bannerContent}>
            <img
              src={competition?.logo ?? "/noimg.jpg"}
              alt="tournament logo"
              className={styles.bannerLogo}
              onError={(e) => {
                e.currentTarget.src = "/noimg.jpg";
              }}
            />
            <div className={styles.bannerText}>
              <h1
                className={clsx(
                  styles.organiserName,
                  globals[`${textColorTheme}Color`],
                )}
              >
                {competition?.name}
              </h1>
              <p className={clsx(styles.organiserName, styles.mutedColor)}>
                {competition?.creator?.username}
              </p>
            </div>
          </div>
        </div>
        <div className={clsx(styles.content)}>
          <Markdown
            className={globals[`${textColorTheme}Color`]}
            rehypePlugins={[rehypeRaw]}
          >
            {competition?.description}
          </Markdown>
        </div>
      </div>
      <div className={clsx(styles.right)}>
        <div className={styles.sidebarContent}>
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
          <SidebarSection name="location">
            <Chip
              label={
                competition?.actualLocation?.name != undefined
                  ? competition?.actualLocation?.name
                  : competition?.location
              }
            ></Chip>
          </SidebarSection>
          <SidebarSection name="country">
            <Chip
              label={`${competition?.country} ${getUnicodeFlagIcon(competition?.country ?? "ZZ")}`}
            ></Chip>
          </SidebarSection>

          <SidebarSection name="mmr">
            <div className={styles.dates}>
              <Chip label={competition?.minimumMMR?.toString()}></Chip>
              <p className={globals[`${textColorTheme}Color`]}>-</p>
              <Chip label={competition?.maximumMMR?.toString()}></Chip>
            </div>
          </SidebarSection>
          <SidebarSection name="type">
            <Chip label={competition?.type}></Chip>
          </SidebarSection>
          <SidebarSection name="category">
            <Chip label={competition?.category?.name}></Chip>
          </SidebarSection>
        </div>
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
                onClick={() => deleteCompetitionMutation.mutate(competition.id)}
              />
            </div>
          ) : (
            <Button variant="primary" label="send join invite" />
          ))
        )}
      </div>
    </div>
  );
}

const SidebarSection = ({ name, children }: SidebarSectionProps) => {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  return (
    <div className={styles.sidebarSection}>
      <p
        className={clsx(
          styles.sidebarSectionName,
          globals.label,
          globals[`${textColorTheme}Color`],
        )}
      >
        {name}
      </p>
      {children}
    </div>
  );
};
