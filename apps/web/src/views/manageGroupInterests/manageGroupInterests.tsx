"use client";

import { useGetGroupInterests } from "api/client/hooks/interests/useGetGroupInterests";
import { InterestsManager } from "views/manageInterests/manageInterests";
import styles from "./manageGroupInterests.module.scss";

export default function ManageGroupInterests({
  groupId,
}: {
  groupId?: number;
}) {
  return (
    <InterestsManager
      query={useGetGroupInterests(groupId)}
      title="manage the group's interests"
      group
      groupId={groupId}
      className={styles.wrapper}
    />
  );
}
