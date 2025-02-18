"use client";

import React, { useState } from "react";
import styles from "./drawer.module.scss";
import globals from "styles/globals.module.scss";
import { clsx } from "clsx";
import { textColor, TextVariants, Variants } from "types/styleTypes";
import { useDrawerContext } from "utils/hooks/useDrawerContext";
import DrawerElement from "views/drawerElement";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import InfoIcon from "@mui/icons-material/Info";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";
import HelpIcon from "@mui/icons-material/Help";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { useAuth } from "api/client/hooks/auth/useAuth";
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

  const { data, isSuccess, isLoading } = useAuth();

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
        {isSuccess && data.id ? (
          <>
            <DrawerElement
              icon={AccountCircleIcon}
              label={data.name}
              href="/user"
            />
            <DrawerElement
              icon={FormatListBulletedIcon}
              label="manage competitions"
              href="/landingPage2#contact"
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
