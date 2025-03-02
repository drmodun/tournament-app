"use client";

import styles from "./manageLFG.module.scss";
import globals from "styles/globals.module.scss";
import { clsx } from "clsx";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import Dialog from "components/dialog";
import Button from "components/button";
import { useEffect, useState } from "react";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { textColor } from "types/styleTypes";
import GroupIcon from "@mui/icons-material/Group";
import AddIcon from "@mui/icons-material/Add";
import InboxIcon from "@mui/icons-material/Inbox";
import EditIcon from "@mui/icons-material/Edit";
import {
  groupRoleEnum,
  IGroupMembershipResponse,
  ILFGResponse,
} from "@tournament-app/types";
import {
  calculateBestPastDateFormat,
  COUNTRY_NAMES_TO_CODES,
  formatDate,
} from "utils/mixins/formatting";
import AddLFPForm from "views/addLFPForm";
import ViewLFP from "views/viewLFP";
import ManageTeamMembers from "views/manageTeamMembers";
import EditTeamForm from "views/editTeamForm";
import { useEditGroup } from "api/client/hooks/groups/useEditGroup";
import GroupJoinRequests from "views/groupJoinRequests";
import { useGetLFPs } from "api/client/hooks/lfp/useGetLFPs";
import { useGetUserLFGs } from "api/client/hooks/lfg/useGetUserLFGs";
import ProgressWheel from "components/progressWheel";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Chip from "components/chip";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDeleteLFG } from "api/client/hooks/lfg/useDeleteLFG";
import AddLFGForm from "views/addLFGForm";
import EditLFGForm from "views/editLFGForm";

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
        <AddLFGForm />
      </Dialog>
      <Dialog
        active={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        variant={theme}
        className={styles.editTeamDialogWrapper}
      >
        <EditLFGForm lfg={active} />
      </Dialog>
      <div className={styles.header}>
        <h3 className={globals[`${theme}Color`]}>
          your looking for groups campaigns
        </h3>
        <button
          className={styles.addButton}
          onClick={() => setAddDialogOpen(true)}
        >
          <AddIcon className={styles[`${theme}Fill`]} />
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
                    <div className={styles.careers}>
                      {item?.careers.map((career) => (
                        <Chip
                          label={career.category.name}
                          variant={textColorTheme}
                          className={styles.career}
                        />
                      ))}
                    </div>
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
    </div>
  );
}
