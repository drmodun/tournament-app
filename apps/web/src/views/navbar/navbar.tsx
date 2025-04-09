"use client";

import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import { useAuth } from "api/client/hooks/auth/useAuth";
import { useLogout } from "api/client/hooks/auth/useLogout";
import { clsx } from "clsx";
import Button from "components/button";
import ProgressWheel from "components/progressWheel";
import NotificationIndicator from "components/notificationIndicator";
import Link from "next/link";
import globals from "styles/globals.module.scss";
import { textColor, TextVariants, Variants } from "types/styleTypes";
import { useDrawerContext } from "utils/hooks/useDrawerContext";
import { useThemeContext } from "utils/hooks/useThemeContext";
import styles from "./navbar.module.scss";

export interface NavbarProps {
  style?: React.CSSProperties;
  variant?: TextVariants;
  className?: string;
}

export default function Navbar({ style, variant, className }: NavbarProps) {
  const drawerContext = useDrawerContext();
  const { theme } = useThemeContext();

  const colorTheme: Variants = variant ?? theme;
  const textColorTheme = textColor(colorTheme);

  const { data, isSuccess, isLoading } = useAuth();
  const logout = useLogout();

  return (
    <div className={clsx(styles.wrapper, className)} style={style}>
      <div className={styles.navLeft}>
        <Link href={data?.id ? "/main" : "/"}>
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
          {isSuccess && data?.id ? (
            <>
              <Link href="/manageCompetitions">manage competitions</Link>
              <Link href="/manageTeams">manage teams</Link>
              <Link href="/manageLFG">manage lfgs</Link>
              <Link href="/manageInterests">manage interests</Link>
              <Link href="/search">search</Link>
              <Link href="/" onClick={logout}>
                logout
              </Link>
            </>
          ) : (
            <>
              <Link href="/search">search</Link>
              <Link href="/#aboutWinning">what is winning.sh?</Link>
              <Link href="/#promote">promote</Link>
              <Link href="/#contact">contact</Link>
              <Link href="/#profileAchievements">achievements</Link>
            </>
          )}
        </div>
        <div className={styles.userPageLinks}>
          {isLoading ? (
            <ProgressWheel variant={colorTheme} />
          ) : isSuccess && data?.id ? (
            <>
              <NotificationIndicator />
              <Link href="/user">
                <img
                  src={data?.profilePicture ?? "/profilePicture.png"}
                  className={styles.userImage}
                  onError={(e) => {
                    e.currentTarget.src = "/profilePicture.png";
                  }}
                />
              </Link>
            </>
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
