"use client";

import {
  IExtendedStageResponseWithTournament,
  IMiniGroupResponse,
  IMiniGroupResponseWithLogo,
} from "@tournament-app/types";
import { useGetGroupMembers } from "api/client/hooks/groups/useGetGroupMembers";
import { useCreateRoster } from "api/client/hooks/rosters/useCreateRoster";
import { clsx } from "clsx";
import Button from "components/button";
import { useState } from "react";
import globals from "styles/globals.module.scss";
import { textColor, TextVariants } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { GroupParticipationType } from "views/manageStage/manageStage";
import styles from "./addRosterForm.module.scss";

export default function AddRosterForm({
  stage,
  group,
  participationId,
  onClose,
  variant,
}: {
  group?:
    | GroupParticipationType
    | IMiniGroupResponse
    | IMiniGroupResponseWithLogo;
  stage?: IExtendedStageResponseWithTournament;
  participationId?: number;
  onClose?: () => void;
  variant?: TextVariants;
}) {
  const theme = variant ?? useThemeContext().theme;
  const textColorTheme = textColor(theme);

  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [selectedSubstitutes, setSelectedSubstitutes] = useState<number[]>([]);

  const { data } = useGetGroupMembers(group?.id ?? group?.id);

  const createRosterMutation = useCreateRoster();
  const onSubmit = async () => {
    if (!stage?.id) return;
    await createRosterMutation.mutateAsync({
      stageId: stage?.id,
      participationId: participationId,
      members: [
        ...selectedMembers.map((member) => {
          return { userId: member, isSubstitute: false };
        }),
        ...selectedSubstitutes.map((member) => {
          return { userId: member, isSubstitute: true };
        }),
      ],
    });
    onClose && onClose();
  };

  const addMember = (member: any) => {
    setSelectedMembers((prev) =>
      prev.includes(member.id)
        ? prev.filter((id) => id !== member.id)
        : prev.length < (stage?.maxPlayersPerTeam ?? 99)
          ? [...prev, member.id]
          : prev,
    );
  };

  const addSubstitute = (member: any): void => {
    setSelectedSubstitutes((prev: number[]) =>
      prev.includes(member.id)
        ? prev.filter((id: number) => id !== member.id)
        : prev.length < (stage?.maxSubstitutes ?? 99)
          ? [...prev, member.id]
          : prev,
    );
  };

  return (
    <div>
      <h3 className={clsx(globals[`${theme}Color`], styles.title)}>
        select members for roster
        {stage?.maxPlayersPerTeam &&
          ` (max ${stage.maxPlayersPerTeam}, min ${stage.minPlayersPerTeam})`}
      </h3>
      <div className={styles.userCardWrapper}>
        {data?.members?.map((member) => {
          if (selectedSubstitutes.includes(member.id)) return null;

          return (
            <div
              onClick={() => addMember(member)}
              className={clsx(
                styles.userCard,

                selectedMembers.includes(member.id)
                  ? [globals.primaryBackgroundColor, globals.lightColor]
                  : globals[`${theme}Color`],
              )}
            >
              <img
                src={member.profilePicture}
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
              onClick={() => addSubstitute(member)}
              className={clsx(
                styles.userCard,
                selectedSubstitutes.includes(member.id)
                  ? [globals.primaryBackgroundColor, globals.lightColor]
                  : globals[`${theme}Color`],
              )}
            >
              <img
                src={member.profilePicture}
                onError={(e) => (e.currentTarget.src = "/profilePicture.png")}
                className={styles.pfp}
              />
              <p>{member.username}</p>
            </div>
          );
        })}
      </div>

      <div className={styles.bottomTitles}>
        <h3 className={clsx(globals[`${theme}Color`])}>current roster</h3>
        <div className={styles.selectedRoster}>
          {selectedMembers.length === 0 ? (
            <p className={globals[`${theme}Color`]}>no members selected!</p>
          ) : (
            data?.members
              ?.filter((member) => selectedMembers.includes(member.id))
              .map((member) => {
                return (
                  <div
                    className={clsx(
                      styles.userCard,
                      globals[`${theme}BackgroundColor`],
                      globals[`${textColorTheme}BackgroundColor`],
                    )}
                  >
                    <img
                      src={member.profilePicture}
                      onError={(e) =>
                        (e.currentTarget.src = "/profilePicture.png")
                      }
                      className={styles.pfp}
                    />
                    <p>{member.username}</p>
                  </div>
                );
              })
          )}
        </div>
        <h3 className={clsx(globals[`${theme}Color`])}>substitutes</h3>
        <div className={styles.selectedRoster}>
          {selectedSubstitutes.length === 0 ? (
            <p className={globals[`${theme}Color`]}>no substitutes selected!</p>
          ) : (
            data?.members
              ?.filter((member) => selectedSubstitutes.includes(member.id))
              .map((member) => {
                return (
                  <div
                    className={clsx(
                      styles.userCard,
                      globals[`${theme}BackgroundColor`],
                      globals[`${textColorTheme}BackgroundColor`],
                    )}
                  >
                    <img
                      src={member.profilePicture}
                      onError={(e) =>
                        (e.currentTarget.src = "/profilePicture.png")
                      }
                      className={styles.pfp}
                    />
                    <p>{member.username}</p>
                  </div>
                );
              })
          )}
        </div>
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
