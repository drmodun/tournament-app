"use client";

import React, { useState } from "react";
import styles from "./drawer.module.scss";
import { clsx } from "clsx";
import { TextVariants } from "types/styleTypes";
import { useDrawerContext } from "utils/hooks/useDrawerContext";
import DrawerElement from "views/drawerElement";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import InfoIcon from "@mui/icons-material/Info";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";
import HelpIcon from "@mui/icons-material/Help";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
export interface DrawerProps {
  style?: React.CSSProperties;
  variant?: TextVariants;
  className?: string;
}

export default function Drawer({
  style,
  variant = "light",
  className,
}: DrawerProps) {
  const [animate, setAnimate] = useState<boolean>(false);
  const drawerContext = useDrawerContext();
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
          animate && !drawerContext.drawerOpen && styles.animate,
        )}
      >
        <DrawerElement
          icon={FormatListBulletedIcon}
          label="features"
          href="#features"
        />
        <DrawerElement icon={HelpIcon} label="why us?" href="#whyUs" />
        <DrawerElement
          icon={ContactSupportIcon}
          label="contact"
          href="#contact"
        />
        <DrawerElement icon={InfoIcon} label="about us" href="#aboutUs" />
        <DrawerElement icon={LoginIcon} label="login" href="/login" />
        <DrawerElement icon={PersonAddIcon} label="register" href="/register" />
      </div>
    </div>
  );
}
