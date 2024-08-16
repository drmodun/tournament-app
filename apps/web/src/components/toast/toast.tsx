"use client";

import styles from "./toast.module.scss";
import globals from "styles/globals.module.scss";
import { TOAST_TYPE_COLOR_MAP } from "types/toastTypes";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { ToastProps } from "types/toastTypes";
import { clsx } from "clsx";

export default function Toast({
  style,
  message,
  type = "success",
  onClick,
}: ToastProps) {
  return (
    <button
      className={clsx(
        styles.toast,
        globals[`${TOAST_TYPE_COLOR_MAP[type]}BackgroundColor`],
        globals.lightColor
      )}
      style={style}
      onClick={onClick && onClick}
    >
      <CheckCircleIcon className={styles.check} />
      <p className={styles.message}>{message}</p>
    </button>
  );
}
