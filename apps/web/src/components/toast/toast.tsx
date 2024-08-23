"use client";

import styles from "./toast.module.scss";
import globals from "styles/globals.module.scss";
import {
  AUTO_CLOSE,
  AUTO_CLOSE_DURATION,
  TOAST_TYPE_COLOR_MAP,
} from "types/toastTypes";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { ToastProps } from "types/toastTypes";
import { clsx } from "clsx";
import { useEffect, useState } from "react";
import { ANIMATION_DURATION } from "types/styleTypes";

export default function Toast({
  style,
  message,
  type = "success",
  onClick,
  className,
}: ToastProps) {
  const [animation, setAnimation] = useState<string>(globals.fadeInAnimation);
  AUTO_CLOSE &&
    useEffect(() => {
      setAnimation(globals.fadeInAnimation);
      const timeout = setTimeout(() => {
        setAnimation(globals.fadeOutAnimation);
      }, AUTO_CLOSE_DURATION - ANIMATION_DURATION);
      return () => clearTimeout(timeout);
    }, []);
  return (
    <button
      className={clsx(
        styles.toast,
        globals[`${TOAST_TYPE_COLOR_MAP[type]}BackgroundColor`],
        globals.lightColor,
        animation,
        className,
      )}
      style={style}
      onClick={onClick && onClick}
    >
      <CheckCircleIcon className={styles.check} />
      <p className={styles.message}>{message}</p>
    </button>
  );
}
