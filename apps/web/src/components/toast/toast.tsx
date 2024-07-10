"use client";

import React, { useState, MouseEventHandler } from "react";
import styles from "./toast.module.scss";
import { Variants, Variant, LIGHT } from "../../types/styleTypes";
import { ToastVariants, TOAST_TYPE_COLOR_MAP } from "../../types/toastTypes";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { ToastProps } from "../../types/toastTypes";

export default function Toast({
  style,
  message,
  type = "success",
  id,
  onClick,
}: ToastProps) {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const hover = () => {
    setIsHovered(true);
  };

  const leave = () => {
    setIsHovered(false);
  };

  return (
    <button
      className={styles.toast}
      style={{
        ...style,
        backgroundColor: TOAST_TYPE_COLOR_MAP[type],
        color: LIGHT,
      }}
      onMouseEnter={hover}
      onMouseLeave={leave}
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
