"use client";

import { useCreateGroupInvite } from "api/client/hooks/groupInvites/useCreateGroupInvite";
import { useAdminUserGroups } from "api/client/hooks/groups/useAdminUserGroups";
import Button from "components/button";
import InfiniteDropdown from "components/infiniteDropdown";
import { useState } from "react";
import { textColor, TextVariants } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import styles from "./inviteUserForm.module.scss";

export default function InviteUserForm({
  userId,
  onClose,
  variant,
}: {
  userId?: number;
  onClose?: () => void;
  variant?: TextVariants;
}) {
  const theme = variant ?? useThemeContext().theme;
  const textColorTheme = textColor(theme);

  const { data, fetchNextPage, isFetching } = useAdminUserGroups();

  const [selectedGroupId, setSelectedGroupId] = useState<number>(-1);

  const createGroupInviteMutation = useCreateGroupInvite();

  const onSubmit = async () => {
    await createGroupInviteMutation.mutateAsync({
      groupId: selectedGroupId,
      userId,
    });
    onClose && onClose();
  };

  return (
    <div className={styles.wrapper}>
      <InfiniteDropdown
        placeholder="select group..."
        variant={textColorTheme}
        loadMore={async () => {
          await fetchNextPage();
        }}
        isFetching={isFetching}
        options={data?.pages?.flatMap((page) => {
          return page.results?.flatMap((group) => {
            return { label: group.group.name, id: group.group.id };
          });
        })}
        onSelect={(index: number) => {
          setSelectedGroupId(
            data?.pages?.flatMap((page) => {
              return page.results?.flatMap((group) => {
                return { label: group.group.name, id: group.group.id };
              });
            })[index]?.id ?? -1,
          );
        }}
      />
      {selectedGroupId != -1 && (
        <Button
          variant="primary"
          label="send invite"
          className={styles.submitButton}
          submit={true}
          onClick={onSubmit}
        />
      )}
    </div>
  );
}
