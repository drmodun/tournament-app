"use client";

import { useState } from "react";
import styles from "./index.module.scss";
import globals from "styles/globals.module.scss";
import Navbar from "views/navbar";
import ManageUser from "views/manageUser";
import { clsx } from "clsx";
import Button from "components/button";
import ManageSettings from "views/manageSettings";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { textColor } from "types/styleTypes";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ManageTeams from "views/manageTeams";
import ManageCompetitions from "views/manageCompetitions";

export default function Competitions() {
  return (
    <div className={styles.wrapper}>
      <Navbar className={styles.navbar} />

      <div>
        <div className={clsx(styles.screen)}>
          <ManageCompetitions />
        </div>
      </div>
    </div>
  );
}
