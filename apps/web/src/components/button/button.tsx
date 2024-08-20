"use client";

import React, { MouseEventHandler } from "react";
import styles from "./button.module.scss";
import globals from "styles/globals.module.scss";
import { Variants } from "types/styleTypes";
import { clsx } from "clsx";

interface ButtonProps {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  label?: string;
  variant?: Variants;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export default function Button({
  children,
  style,
  label,
  variant = "light",
  onClick,
}: ButtonProps) {
  return (
    <button
      className={clsx(
        styles.button,
        globals[`${variant}BackgroundColorDynamic`],
        globals[`${variant}TextColor`],
      )}
      style={style}
      onClick={onClick ? onClick : () => {}}
    >
      <p className={styles.label}>{label}</p>
      {children}
    </button>
  );
}
