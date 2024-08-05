"use client";

import styles from "./toast.module.scss";
import { LIGHT } from "../../types/styleTypes";
import { TOAST_TYPE_COLOR_MAP } from "../../types/toastTypes";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { ToastProps } from "../../types/toastTypes";

export default function Toast({
  style,
  message,
  type = "success",
  onClick,
}: ToastProps) {
  return (
    <button
      className={styles.toast}
      style={{
        ...style,
        backgroundColor: TOAST_TYPE_COLOR_MAP[type],
        color: LIGHT,
      }}
      onClick={onClick ? onClick : () => {}}
    >
      <CheckCircleIcon className={styles.check} />
      <p className={styles.message}>{message}</p>
    </button>
  );
}

/*
    <Toast
      className={styles.Toast}
      style={{
        ...style,
        backgroundColor: isHovered
          ? ToastVariant.mutedColor()
          : ToastVariant.color(),
        color: ToastVariant.textColor(),
      }}
      onMouseEnter={hover}
      onMouseLeave={leave}
      onClick={onClick ? onClick : () => {}}
    >
      <p className={styles.label}>{label}</p>
      {children}
    </Toast>
*/
