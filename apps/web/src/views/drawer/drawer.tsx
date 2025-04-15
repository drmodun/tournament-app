"use client";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import HelpIcon from "@mui/icons-material/Help";
import InfoIcon from "@mui/icons-material/Info";
import LoginIcon from "@mui/icons-material/Login";
import PublicIcon from "@mui/icons-material/Public";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useAuth } from "api/client/hooks/auth/useAuth";
import { clsx } from "clsx";
import React, { useState } from "react";
import globals from "styles/globals.module.scss";
import { TextVariants, Variants } from "types/styleTypes";
import { useDrawerContext } from "utils/hooks/useDrawerContext";
import { useThemeContext } from "utils/hooks/useThemeContext";
import DrawerElement from "views/drawerElement";
import styles from "./drawer.module.scss";
import { useLogout } from "api/client/hooks/auth/useLogout";
import GroupsIcon from "@mui/icons-material/Groups";
export interface DrawerProps {
  style?: React.CSSProperties;
  variant?: TextVariants;
  className?: string;
}

export default function Drawer({ style, variant, className }: DrawerProps) {
  const [animate, setAnimate] = useState<boolean>(false);
  const drawerContext = useDrawerContext();
  const { theme } = useThemeContext();

  const colorTheme: Variants = variant ?? theme;

  const { data, isSuccess } = useAuth();

  const logout = useLogout();

  return (
    <div
      className={clsx(
        styles.wrapper,
        className,
        !drawerContext.drawerOpen && !animate && styles.hidden,
        !drawerContext.drawerOpen && animate && styles.hiddenAnimate
      )}
      style={style}
      onClick={(e) => {
        if (e.target !== e.currentTarget) return;
        drawerContext.setDrawerOpen(false);
        setAnimate(true);
      }}
      onKeyDown={(e) => {
        if (e.key == "Escape") setAnimate(false);
      }}
    >
      <div
        className={clsx(
          styles.drawer,
          globals[`${colorTheme}BackgroundColor`],
          animate && !drawerContext.drawerOpen && styles.animate
        )}
      >
        {isSuccess && data?.id ? (
          <>
            <DrawerElement
              icon={AccountCircleIcon}
              label={data?.name}
              href="/user"
            />
            <DrawerElement
              icon={NotificationsIcon}
              label="notifications"
              href="/notifications"
            />
            <DrawerElement
              icon={FormatListBulletedIcon}
              label="manage competitions"
              href="/manageCompetitions"
            />
            <DrawerElement
              icon={GroupsIcon}
              label="manage teams"
              href="/manageTeams"
            />
            <DrawerElement
              icon={PublicIcon}
              label="manage lfgs"
              href="/manageLFG"
            />
            <DrawerElement
              icon={HelpIcon}
              label="logout"
              href="/logout"
              onClick={logout}
            />
          </>
        ) : (
          <>
            <DrawerElement
              icon={FormatListBulletedIcon}
              label="what is winning.sh?"
              href="/#aboutWinning"
            />
            <DrawerElement icon={HelpIcon} label="promote" href="/#promote" />
            <DrawerElement
              icon={ContactSupportIcon}
              label="contact"
              href="/#contact"
            />
            <DrawerElement
              icon={InfoIcon}
              label="achievements"
              href="/#profileAchievements"
            />
            <DrawerElement icon={LoginIcon} label="login" href="/login" />
            <DrawerElement
              icon={PersonAddIcon}
              label="register"
              href="/register"
            />
          </>
        )}
      </div>
    </div>
  );
}
