"use client";

import { IExtendedStageResponseWithTournament } from "@tournament-app/types";
import { useGetGroupMembers } from "api/client/hooks/groups/useGetGroupMembers";
import { useCreateRoster } from "api/client/hooks/rosters/useCreateRoster";
import { clsx } from "clsx";
import Button from "components/button";
import { useState } from "react";
import globals from "styles/globals.module.scss";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { GroupParticipationType } from "views/manageStage/manageStage";
import styles from "./addRosterForm.module.scss";

export default function AddRosterForm({
  stage,
  group,
}: {
  group?: GroupParticipationType;
  stage?: IExtendedStageResponseWithTournament;
}) {
  const { theme } = useThemeContext();

  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [selectedSubstitutes, setSelectedSubstitutes] = useState<number[]>([]);

  const { data } = useGetGroupMembers(group?.groupId);

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
