"use client";

import { useEffect, useState } from "react";
import styles from "./addRosterForm.module.scss";
import globals from "styles/globals.module.scss";
import { textColor, TextVariants } from "types/styleTypes";
import {
  ICreateGroupRequest,
  ICreateLFPRequest,
  IExtendedStageResponseWithTournament,
  IMiniGroupResponseWithLogo,
  IStageResponseWithTournament,
  tournamentLocationEnum,
} from "@tournament-app/types";
import { UseMutationResult } from "@tanstack/react-query";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { FormProvider, useForm } from "react-hook-form";
import Input from "components/input";
import RichEditor from "components/richEditor";
import CheckboxGroup from "components/checkboxGroup";
import Dropdown from "components/dropdown";
import Button from "components/button";
import { useCreateLFP } from "api/client/hooks/lfp/useCreateLFP";
import { clsx } from "clsx";
import MultilineInput from "components/multilineInput";
import { useGetGroupMembers } from "api/client/hooks/groups/useGetGroupMembers";
import { useCreateRoster } from "api/client/hooks/rosters/useCreateRoster";
import { useCheckIfUserIsParticipating } from "api/client/hooks/participations/useCheckIfUserIsParticipating";
import { GroupParticipationType } from "views/manageStage/manageStage";

export default function AddRosterForm({
  stage,
  group,
}: {
  group?: GroupParticipationType;
  stage?: IExtendedStageResponseWithTournament;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const createLFPMutation = useCreateLFP();

  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [selectedSubstitutes, setSelectedSubstitutes] = useState<number[]>([]);

  const { data, isLoading } = useGetGroupMembers(group?.groupId);

  const createRosterMutation = useCreateRoster();
  const onSubmit = () => {
    stage?.id &&
      createRosterMutation.mutate({
        stageId: stage?.id,
        participationId: group?.id,
        members: [
          ...selectedMembers.map((member) => {
            return { userId: member, isSubstitute: false };
          }),
          ...selectedSubstitutes.map((member) => {
            return { userId: member, isSubstitute: true };
          }),
        ],
      });
  };

  return (
    <div>
      <h3 className={clsx(globals[`${theme}Color`], styles.title)}>
        select members for roster
        {stage?.maxPlayersPerTeam && ` (max is ${stage.maxPlayersPerTeam})`}
      </h3>
      <div className={styles.userCardWrapper}>
        {data?.members?.map((member) => {
          return (
            <div
              onClick={() => {
                setSelectedMembers((prev) =>
                  selectedMembers.includes(member.id)
                    ? prev.filter((id) => id !== member.id)
                    : prev.length < (stage?.maxPlayersPerTeam ?? 99)
                      ? [...prev, member.id]
                      : prev,
                );
              }}
              className={clsx(
                styles.userCard,

                selectedMembers.includes(member.id) && [
                  globals.primaryBackgroundColor,
                  globals.lightColor,
                ],
                globals[`${theme}Color`],
              )}
            >
              <img
                src={member.profilePicture}
                alt="profile picture"
                onError={(e) => (e.currentTarget.src = "/profilePicture.png")}
                className={styles.pfp}
              />
              <p>{member.username}</p>
            </div>
          );
        })}
      </div>
      <h3 className={clsx(globals[`${theme}Color`], styles.title)}>
        select members for roster substitutes
        {stage?.maxSubstitutes && ` (max is ${stage.maxSubstitutes})`}
      </h3>
      <div className={styles.userCardWrapper}>
        {data?.members?.map((member) => {
          if (selectedMembers.includes(member.id)) return null;
          return (
            <div
              onClick={() => {
                setSelectedSubstitutes((prev) =>
                  selectedSubstitutes.includes(member.id)
                    ? prev.filter((id) => id !== member.id)
                    : prev.length < (stage?.maxSubstitutes ?? 99)
                      ? [...prev, member.id]
                      : prev,
                );
              }}
              className={clsx(
                styles.userCard,

                selectedSubstitutes.includes(member.id) && [
                  globals.primaryBackgroundColor,
                  globals.lightColor,
                ],
                globals[`${theme}Color`],
              )}
            >
              <img
                src={member.profilePicture}
                alt="profile picture"
                onError={(e) => (e.currentTarget.src = "/profilePicture.png")}
                className={styles.pfp}
              />
              <p>{member.username}</p>
            </div>
          );
        })}
      </div>

      <Button
        variant="primary"
        label="create roster"
        className={styles.submitLfpButton}
        submit={true}
        onClick={onSubmit}
      />
    </div>
  );
}
