"use client";

import { useGetGroupTournaments } from "api/client/hooks/groups/useGetGroupTournaments";
import { clsx } from "clsx";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import LinkCard from "components/linkCard";
import styles from "./groupCompetitions.module.scss";

export default function GroupMembersDialog({
  groupId,
}: {
  groupId: number | undefined;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const { data } = useGetGroupTournaments(groupId);

  return (
    <div className={clsx(styles.wrapper)}>
      <p>
        <b className={globals[`${textColorTheme}Color`]}>competitions</b>
      </p>
      <div className={styles.userCardWrapper}>
        {data?.results?.length == 0 ? (
          <p className={globals[`${textColorTheme}Color`]}>
            no competitions found!
          </p>
        ) : (
          data?.results.map((comp) => {
            return (
              <LinkCard
                key={comp.id}
                href={`/contest/${comp.id}`}
                image={comp.logo}
                fallbackImage="/noimg.jpg"
                name={comp.name}
                country={comp.country}
                detail={comp.type ?? ""}
                variant={theme}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
