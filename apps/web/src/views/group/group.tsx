"use client";

import styles from "./group.module.scss";
import globals from "styles/globals.module.scss";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { textColor } from "types/styleTypes";
import { clsx } from "clsx";
import Button from "components/button";
import Chip from "components/chip";
import {
  COUNTRY_NAMES_TO_CODES,
  formatDate,
  formatDateTime,
} from "utils/mixins/formatting";
import Markdown from "react-markdown";
import getUnicodeFlagIcon from "country-flag-icons/unicode";
import {
  IExtendedTournamentResponse,
  IGroupResponseExtended,
} from "@tournament-app/types";
import { useAuth } from "api/client/hooks/auth/useAuth";
import { useRouter } from "next/navigation";
import { useCheckIfGroupMember } from "api/client/hooks/groups/useCheckIfGroupMember";
import ProgressWheel from "components/progressWheel";
import Dialog from "components/dialog";
import GroupMembersDialog from "views/groupMembersDialog";
import { useState } from "react";
import GroupCompetitionsDialog from "views/groupCompetitionsDialog";
import rehypeRaw from "rehype-raw";
import { useLeaveUserGroup } from "api/client/hooks/groups/useLeaveUserGroup";
import { useCreateGroupJoinRequest } from "api/client/hooks/groups/useCreateGroupJoinRequest";
import RichEditor from "components/richEditor";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";

type SidebarSectionProps = {
  name: string;
  children?: React.ReactNode;
};

export default function Group({ group }: { group: IGroupResponseExtended }) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const { data: userData } = useAuth();
  const { data, isLoading, isError } = useCheckIfGroupMember(group?.id);

  const [groupMembersDialogActive, setGroupMembersDialogActive] =
    useState<boolean>(false);
  const [groupCompetitionsDialogActive, setGroupCompetitionsDialogActive] =
    useState<boolean>(false);

  const leaveGroupMutation = useLeaveUserGroup();
  const groupJoinRequestMutation = useCreateGroupJoinRequest();

  const methods = useForm<{ message: string }>();
  const onSubmit: SubmitHandler<{ message: string }> = async (data) => {
    if (isLoading || !isError) return;

    console.log(data);

    groupJoinRequestMutation.mutate({
      groupId: group?.id,
      message: data?.message,
    });

    //location.reload();
  };

  const handleLeave = async () => {
    if (isLoading || isError) return;

    await leaveGroupMutation.mutateAsync(group?.id);

    location.reload();
  };

  return (
    <div className={clsx(styles.wrapper)}>
      <Dialog
        active={groupMembersDialogActive}
        onClose={() => setGroupMembersDialogActive(false)}
        className={styles.groupMembersDialogWrapper}
      >
        <GroupMembersDialog groupId={group?.id} />
      </Dialog>
      <Dialog
        active={groupCompetitionsDialogActive}
        onClose={() => setGroupCompetitionsDialogActive(false)}
        className={styles.groupMembersDialogWrapper}
      >
        <GroupCompetitionsDialog groupId={group?.id} />
      </Dialog>
      <div className={clsx(styles.left)}>
        <div className={clsx(styles.banner)}>
          <div className={styles.bannerContent}>
            <img
              src={group?.logo ?? "/noimg.jpg"}
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
                {group?.name}{" "}
                <span className={styles.textAbbreviation}>
                  ({group?.abbreviation})
                </span>
              </h1>
              <p className={clsx(styles.organiserName, styles.mutedColor)}>
                {group?.type}
              </p>
            </div>
          </div>
        </div>
        <div className={clsx(styles.content)}>
          <Markdown
            className={globals[`${textColorTheme}Color`]}
            rehypePlugins={[rehypeRaw]}
          >
            {group?.description}
          </Markdown>
        </div>
      </div>
      <div className={clsx(styles.right)}>
        <div className={styles.sidebarContent}>
          <SidebarSection name="created at">
            <Chip
              label={formatDate(new Date(group?.createdAt))}
              variant={textColorTheme}
            ></Chip>
          </SidebarSection>
          <SidebarSection name="location">
            <Chip label={group?.location} variant={textColorTheme}></Chip>
          </SidebarSection>
          <SidebarSection name={`members (${group?.memberCount})`}>
            <Chip
              label={"see members"}
              variant={textColorTheme}
              onClick={() => setGroupMembersDialogActive(true)}
            ></Chip>
          </SidebarSection>
          <SidebarSection name="focus">
            <Chip label={group?.focus} variant={textColorTheme}></Chip>
          </SidebarSection>
          <SidebarSection name="subscribers">
            <Chip
              label={group?.subscriberCount?.toString()}
              variant={textColorTheme}
            ></Chip>
          </SidebarSection>
          <SidebarSection name={`competitions (${group?.tournamentCount})`}>
            <Chip
              label={"see competitions"}
              variant={textColorTheme}
              onClick={() => setGroupCompetitionsDialogActive(true)}
            ></Chip>
          </SidebarSection>
        </div>
        {userData &&
          (isLoading ? (
            <ProgressWheel variant={textColorTheme} />
          ) : isError ? (
            <FormProvider {...methods}>
              <form
                onSubmit={methods.handleSubmit(onSubmit)}
                className={styles.innerFormWrapper}
              >
                <p
                  className={clsx(
                    globals[`${textColorTheme}Color`],
                    globals.label,
                  )}
                >
                  join invite message
                </p>
                <RichEditor
                  name="message"
                  isReactHookForm={true}
                  mobile={true}
                />
                <Button
                  label="send join invite"
                  variant="primary"
                  className={styles.joinButton}
                  submit={true}
                />
              </form>
            </FormProvider>
          ) : (
            <Button
              label="leave group"
              variant="danger"
              className={styles.joinButton}
              onClick={handleLeave}
            />
          ))}
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
