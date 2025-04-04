"use client";

import {
  groupRoleEnum,
  groupRoleEnumType,
  IGroupMembershipQueryRequest,
} from "@tournament-app/types";
import { clsx } from "clsx";
import Button from "components/button";
import Dropdown from "components/dropdown";
import { Dispatch, SetStateAction, useState } from "react";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import styles from "./userGroupsFilterModal.module.scss";

export default function UserGroupsFilterModal({
  setFilters,
  onClose,
}: {
  setFilters: Dispatch<SetStateAction<IGroupMembershipQueryRequest>>;
  onClose: () => void;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const [roleFilter, setRoleFilter] = useState<groupRoleEnumType | "all">(
    "all",
  );

  const submit = () => {
    const filters: IGroupMembershipQueryRequest = {};
    if (roleFilter !== "all") {
      filters.role = roleFilter;
    }

    setFilters(filters);
    onClose && onClose();
  };

  return (
    <div className={clsx(styles.wrapper)}>
      <p>
        <b className={globals[`${textColorTheme}Color`]}>filters</b>
      </p>
      <div className={styles.filters}>
        <p className={clsx(globals.label, globals[`${textColorTheme}Color`])}>
          your role
        </p>
        <Dropdown
          placeholder="select role..."
          options={[
            { label: "all" },
            { label: "owner" },
            { label: "admin" },
            { label: "member" },
          ]}
          variant={textColorTheme}
          onSelect={(index: number) => {
            switch (index) {
              case 0:
                setRoleFilter("all");
                break;
              case 1:
                setRoleFilter(groupRoleEnum.OWNER);
                break;
              case 2:
                setRoleFilter(groupRoleEnum.ADMIN);
                break;
              case 3:
                setRoleFilter(groupRoleEnum.MEMBER);
                break;
            }
          }}
        />
      </div>
      <Button variant="secondary" label="apply filters" onClick={submit} />
    </div>
  );
}
