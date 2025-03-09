"use client";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { ILFGResponse } from "@tournament-app/types";
import { useDeleteLFG } from "api/client/hooks/lfg/useDeleteLFG";
import { useGetUserLFGs } from "api/client/hooks/lfg/useGetUserLFGs";
import { clsx } from "clsx";
import Button from "components/button";
import Chip from "components/chip";
import Dialog from "components/dialog";
import ProgressWheel from "components/progressWheel";
import Link from "next/link";
import { useState } from "react";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { calculateBestPastDateFormat } from "utils/mixins/formatting";
import AddLFGForm from "views/addLFGForm";
import EditLFGForm from "views/editLFGForm";
import styles from "./manageLFG.module.scss";

export default function ManageLFG() {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const [active, setActive] = useState<ILFGResponse>();

  let { data, isLoading } = useGetUserLFGs();
  const deleteLFGMutation = useDeleteLFG();

  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);

  const handleClick = (lfg: ILFGResponse) => {
    setActive(lfg);
    setEditDialogOpen(true);
  };

  const handleDelete = async (lfg: ILFGResponse) => {
    await deleteLFGMutation.mutateAsync(lfg.id);

    if (deleteLFGMutation.isSuccess) {
      data = data?.filter((x) => x != lfg);
    }
  };

  return (
    <div
      className={clsx(
        styles.wrapper,
        globals[`${textColorTheme}BackgroundColor`],
      )}
    >
      <Dialog
        active={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        variant={theme}
        className={styles.editTeamDialogWrapper}
      >
        <AddLFGForm onClose={() => setAddDialogOpen(false)} />
      </Dialog>
      <Dialog
        active={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        variant={theme}
        className={styles.editTeamDialogWrapper}
      >
        <EditLFGForm lfg={active} onClose={() => setEditDialogOpen(false)} />
      </Dialog>
      <div className={styles.header}>
        <p>
          <b className={globals[`${theme}Color`]}>
            your looking for groups campaigns
          </b>
        </p>
        <button
          className={styles.addButton}
          onClick={() => setAddDialogOpen(true)}
        >
          <AddIcon className={globals[`${theme}FillChildren`]} />
        </button>
      </div>
      <div>
        {isLoading ? (
          <div className={styles.loading}>
            <ProgressWheel variant={textColorTheme} />
          </div>
        ) : (
          <div className={styles.cards}>
            {data &&
              data.map((item: ILFGResponse) => (
                <div
                  className={clsx(
                    globals[`${theme}BackgroundColor`],
                    globals[`${textColorTheme}Color`],
                    styles.card,
                  )}
                >
                  <p>{item?.message}</p>
                  <div className={styles.bottomWrapper}>
                    {item?.careers[0] && (
                      <div className={styles.careers}>
                        {item?.careers
                          .filter((item) => {
                            console.log(item?.category?.id);
                            return item?.category?.id != undefined;
                          })
                          .map((career) => (
                            <Chip
                              label={career.category.name}
                              variant={textColorTheme}
                              className={styles.career}
                            />
                          ))}
                      </div>
                    )}
                    <div className={styles.bottom}>
                      <Chip
                        label={calculateBestPastDateFormat(
                          new Date(item.createdAt),
                        )}
                        variant="primary"
                      ></Chip>
                      <div className={styles.actionButtons}>
                        <Button
                          variant="warning"
                          onClick={() => handleClick(item)}
                          className={styles.actionButton}
                        >
                          <EditIcon
                            className={clsx(
                              globals.darkFillChildren,
                              styles.actionIcon,
                            )}
                          />
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => {
                            handleDelete(item);
                          }}
                          className={styles.actionButton}
                        >
                          <DeleteIcon
                            className={clsx(
                              globals.lightFillChildren,
                              styles.actionIcon,
                            )}
                          />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
      <Link href="/manageGroupInvites">
        <Button label="manage group invites" variant="primary" />
      </Link>
    </div>
  );
}
