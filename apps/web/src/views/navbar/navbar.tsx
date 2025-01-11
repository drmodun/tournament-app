"use client";

import { useState } from "react";
import styles from "./navbar.module.scss";
import globals from "styles/globals.module.scss";
import { clsx } from "clsx";
import { textColor, TextVariants, Variants } from "types/styleTypes";
import Button from "components/button";
import Link from "next/link";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import { useDrawerContext } from "utils/hooks/useDrawerContext";
import { useThemeContext } from "utils/hooks/useThemeContext";

export interface NavbarProps {
  style?: React.CSSProperties;
  variant?: TextVariants;
  className?: string;
}

export default function Navbar({ style, variant, className }: NavbarProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const drawerContext = useDrawerContext();
  const { theme } = useThemeContext();

  const colorTheme: Variants = variant ?? theme;
  const textColorTheme = textColor(colorTheme);

  return (
    <div className={clsx(styles.wrapper, className)} style={style}>
      <div className={styles.navLeft}>
        <Link href="/">
          <EmojiEventsOutlinedIcon
            style={{ fill: textColorTheme === "dark" ? "#21262c" : "#f2f2f2" }}
            className={clsx(globals.darkFill, styles.logo)}
          />
        </Link>
      </div>
      <div className={styles.navRight}>
        <div
          className={clsx(styles.pageLinks, styles[`${textColorTheme}Links`])}
        >
          {isLoggedIn ? (
            <>
              <Link href="/landingPage2#contact">manage competitions</Link>
              <Link href="/manageTeams">manage teams</Link>
            </>
          ) : (
            <>
              <Link href="/landingPage2#aboutWinning">what is winning.sh?</Link>
              <Link href="/landingPage2#promote">promote</Link>
              <Link href="/landingPage2#contact">contact</Link>
              <Link href="/landingPage2#profileAchievements">achievements</Link>
            </>
          )}
        </div>
        <div className={styles.userPageLinks}>
          {isLoggedIn ? (
            <Link href="/user">
              <img
                src="https://prairieblossomnursery.com/cdn/shop/products/Hibiscusfiesta_6b1a41c4-9fdd-42e5-95bf-1fd610fe0c9c_1200x1200.png?v=1671389287"
                alt=""
                className={styles.userImage}
              />
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button label="login" variant={textColorTheme} />
              </Link>
              <Link href="/register">
                <Button label="register" variant={textColorTheme} />
              </Link>
            </>
          )}
        </div>
      </div>
      <div className={styles.mobileNav}>
        <button
          title="open menu"
          className={styles.mobileNavButton}
          onClick={() => {
            drawerContext.setDrawerOpen(!drawerContext.drawerOpen);
            console.log(drawerContext.drawerOpen);
          }}
        >
          <MenuIcon
            className={styles.mobileNavMenu}
            style={{ fill: textColorTheme === "dark" ? "#21262c" : "#f2f2f2" }}
          />
        </button>
      </div>
    </div>
  );
}
