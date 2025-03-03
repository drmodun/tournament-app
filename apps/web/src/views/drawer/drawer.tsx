"use client";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import HelpIcon from "@mui/icons-material/Help";
import InfoIcon from "@mui/icons-material/Info";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useAuth } from "api/client/hooks/auth/useAuth";
import { clsx } from "clsx";
import React, { useState } from "react";
import globals from "styles/globals.module.scss";
import { TextVariants, Variants } from "types/styleTypes";
import { useDrawerContext } from "utils/hooks/useDrawerContext";
import { useThemeContext } from "utils/hooks/useThemeContext";
import DrawerElement from "views/drawerElement";
import styles from "./drawer.module.scss";
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

  return (
    <div
      className={clsx(
        styles.wrapper,
        className,
        !drawerContext.drawerOpen && !animate && styles.hidden,
        !drawerContext.drawerOpen && animate && styles.hiddenAnimate,
      )}
      style={style}
      onClick={(e) => {
        if (e.target !== e.currentTarget) return;
        drawerContext.setDrawerOpen(false);
        setAnimate(true);
      }}
    >
      <div
        className={clsx(
          styles.drawer,
          globals[`${colorTheme}BackgroundColor`],
          animate && !drawerContext.drawerOpen && styles.animate,
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
              icon={FormatListBulletedIcon}
              label="manage competitions"
              href="/manageCompetitions"
            />
            <DrawerElement
              icon={HelpIcon}
              label="manage teams"
              href="/manageTeams"
            />
          </>
        ) : (
          <>
            <DrawerElement
              icon={FormatListBulletedIcon}
              label="what is winning.sh?"
              href="/landingPage2#aboutWinning"
            />
            <DrawerElement
              icon={HelpIcon}
              label="promote"
              href="/landingPage2#promote"
            />
            <DrawerElement
              icon={ContactSupportIcon}
              label="contact"
              href="/landingPage2#contact"
            />
            <DrawerElement
              icon={InfoIcon}
              label="achievements"
              href="/landingPage2#profileAchievements"
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
