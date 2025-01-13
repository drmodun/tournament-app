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

export default function Teams() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const { theme } = useThemeContext();
  const tabs: { component: JSX.Element; name: string }[] = [
    { component: <ManageUser />, name: "manage user" },
    { component: <ManageSettings />, name: "manage settingsdsadasdasdsa" },
    { component: <ManageSettings />, name: "manage settingsdsadasdasdsa" },
    { component: <ManageSettings />, name: "manage settingsdsadasdasdsa" },
  ];

  return (
    <div className={styles.wrapper}>
      <Navbar className={styles.navbar} />

      <div>
        <div className={clsx(styles.screen)}>
          <div
            className={clsx(
              styles.tabs,
              globals[`${textColor(theme)}BackgroundColor`],
            )}
          >
            <button className={clsx(styles.arrowButton)} title="back">
              <ArrowBackIcon className={clsx(styles[`${theme}Fill`])} />
            </button>
            <div className={styles.teamsWrapper}>
              {tabs.slice(0, 3).map((tab, index) => (
                <Button
                  key={index}
                  className={clsx(
                    styles.tab,
                    activeTab === index && styles.active,
                    activeTab === index && globals.primaryBackgroundColor,
                  )}
                  onClick={() => setActiveTab(index)}
                  label={tab.name}
                  variant={activeTab === index ? "primary" : textColor(theme)}
                />
              ))}
            </div>
            <button className={clsx(styles.arrowButton)} title="forward">
              <ArrowForwardIcon className={clsx(styles[`${theme}Fill`])} />
            </button>
          </div>
          <ManageTeams />
        </div>
      </div>
    </div>
  );
}
