"use client";

import { useState } from "react";
import styles from "./navbar.module.scss";
import globals from "styles/globals.module.scss";
import { clsx } from "clsx";
import { textColor, TextVariants } from "types/styleTypes";
import Button from "components/button";
import Link from "next/link";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import { useDrawerContext } from "utils/hooks/useDrawerContext";

export interface NavbarProps {
  style?: React.CSSProperties;
  variant?: TextVariants;
  className?: string;
}

export default function Navbar({
  style,
  variant = "light",
  className,
}: NavbarProps) {
  const drawerContext = useDrawerContext();

  return (
    <div className={clsx(styles.wrapper, className)} style={style}>
      <div className={styles.navLeft}>
        <Link href="/">
          <EmojiEventsOutlinedIcon
            className={clsx(styles.logo, globals[`${variant}Fill`])}
          />
        </Link>
      </div>
      <div className={styles.navRight}>
        <div className={clsx(styles.pageLinks, styles[`${variant}Links`])}>
          <Link href="#features">features</Link>
          <Link href="#whyUs">why us?</Link>
          <Link href="#contact">contact</Link>
          <Link href="#aboutUs">about us</Link>
        </div>
        <div className={styles.userPageLinks}>
          <Link href="/login">
            <Button label="login" variant={variant} />
          </Link>
          <Link href="/register">
            <Button label="register" variant="primary" />
          </Link>
        </div>
      </div>
      <div className={styles.mobileNav}>
        <button
          className={styles.mobileNavButton}
          onClick={() => {
            drawerContext.setDrawerOpen(!drawerContext.drawerOpen);
            console.log(drawerContext.drawerOpen);
          }}
        >
          <MenuIcon className={styles.mobileNavMenu} />
        </button>
      </div>
    </div>
  );
}
