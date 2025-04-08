"use client";

import {
  IExtendedStageResponseWithTournament,
  IRosterResponse,
} from "@tournament-app/types";
import { useGetGroupMembers } from "api/client/hooks/groups/useGetGroupMembers";
import { useEditRoster } from "api/client/hooks/rosters/useUpdateRoster";
import { clsx } from "clsx";
import Button from "components/button";
import { useEffect, useState } from "react";
import globals from "styles/globals.module.scss";
import { textColor, TextVariants } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import styles from "./editRosterForm.module.scss";

export default function EditRosterForm({
  roster,
  onClose,
  stage,
  variant,
}: {
  roster?: IRosterResponse;
  onClose?: () => void;
  stage?: IExtendedStageResponseWithTournament;
  variant?: TextVariants;
}) {
  const theme = variant ?? useThemeContext().theme;
  const textColorTheme = textColor(theme);

  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [selectedSubstitutes, setSelectedSubstitutes] = useState<number[]>([]);

  const { data } = useGetGroupMembers(roster?.participation?.group?.id);

  const updateRosterMutation = useEditRoster();
  const onSubmit = async () => {
    await updateRosterMutation.mutateAsync({
      id: roster?.id,
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

  useEffect(() => {
    const members = [];
    const substitutes = [];

    for (const player of roster?.players ?? []) {
      if (player.isSubstitute) {
        substitutes.push(player.user.id);
        continue;
      }

      members.push(player.user.id);
    }

    setSelectedMembers(members);
    setSelectedSubstitutes(substitutes);
  }, []);

  const addMember = (member: any) => {
    setSelectedMembers((prev) => {
      return prev.includes(member.id)
        ? prev.filter((id) => id !== member.id)
        : prev.length < (stage?.maxPlayersPerTeam ?? 99)
          ? [...prev, member.id]
          : prev;
    });
  };

  const addSubstitute = (member: any): void => {
    setSelectedSubstitutes((prev: number[]) =>
      prev.includes(member.id)
        ? prev.filter((id: number) => id !== member.id)
        : prev.length < (stage?.maxSubstitutes ?? 99)
          ? [...prev, member.id]
          : prev
    );
  };

  return (
    <div>
      <h3 className={clsx(globals[`${textColorTheme}Color`], styles.title)}>
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
                  : globals[`${textColorTheme}Color`]
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
      <h3 className={clsx(globals[`${textColorTheme}Color`], styles.title)}>
        select members for roster substitutes
        {stage?.maxSubstitutes && ` (max ${stage.maxSubstitutes})`}
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
                  : globals[`${textColorTheme}Color`]
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

      <div>
        <h3 className={clsx(globals[`${textColorTheme}Color`], styles.title)}>
          current roster
        </h3>
        <div className={styles.selectedRoster}>
          {selectedMembers.length === 0 ? (
            <p className={globals[`${textColorTheme}Color`]}>
              no members selected!
            </p>
          ) : (
            data?.members
              ?.filter((member) => selectedMembers.includes(member.id))
              .map((member) => {
                return (
                  <div
                    className={clsx(
                      styles.userCard,
                      globals[`${theme}BackgroundColor`],
                      globals[`${textColorTheme}BackgroundColor`]
                    )}
                  >
                    <img
                      src={member.profilePicture}
                      alt="profile picture"
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
        <h3
          className={clsx(
            globals[`${textColorTheme}Color`],
            styles.substitutesTitle
          )}
        >
          substitutes
        </h3>
        <div className={styles.selectedRoster}>
          {selectedSubstitutes.length === 0 ? (
            <p className={globals[`${textColorTheme}Color`]}>
              no substitutes selected!
            </p>
          ) : (
            data?.members
              ?.filter((member) => selectedSubstitutes.includes(member.id))
              .map((member) => {
                return (
                  <div
                    className={clsx(
                      styles.userCard,
                      globals[`${theme}BackgroundColor`],
                      globals[`${textColorTheme}BackgroundColor`]
                    )}
                  >
                    <img
                      src={member.profilePicture}
                      alt="profile picture"
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
        variant="warning"
        label="edit roster"
        className={styles.submitLfpButton}
        submit={true}
        onClick={onSubmit}
        disabled={!stage || stage?.minPlayersPerTeam > selectedMembers.length}
      />
    </div>
  );
}
