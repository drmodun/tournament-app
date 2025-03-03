"use client";

import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { clsx } from "clsx";
import Link from "next/link";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import styles from "./promote.module.scss";

export default function Promote() {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  return (
    <div className={styles.wrapper}>
      <div className={styles.leftContent}>
        <h1
          className={clsx(
            globals.titleText,
            styles.header,
            styles[`${textColorTheme}Header`],
          )}
        >
          promote your events!
        </h1>
        <p className={clsx(styles.text, globals[`${textColorTheme}Color`])}>
          promoting your event is a breeze with winning.sh! 🎉 get your
          competition featured at the top of our main page for maximum
          visibility 📢, making it easier to attract participants. reach a wider
          audience, grow your event's presence, and fill up those spots fast! 🚀
        </p>
        <Link
          href="mailto: winning.sh.info@gmail.com"
          className={clsx(
            styles.promoteLink,
            globals[`${textColorTheme}Color`],
          )}
        >
          <p className={styles.promoteText}>promote</p>
          <ArrowRightIcon />
        </Link>
      </div>
      <div className={styles.imageWrapper}>
        <img
          className={clsx(styles.image)}
          src="https://images.unsplash.com/photo-1593489464397-8a9784e5d2de?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Man with a megaphone."
        />
      </div>
    </div>
  );
}
/*

<img
        className={clsx(styles.image)}
        src="https://images.unsplash.com/photo-1552127966-d24b805b9be7?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="People winning a sports competition."
      />
*/
