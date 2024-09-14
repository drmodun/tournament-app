"use client";

import React, { MouseEventHandler } from "react";
import styles from "./button.module.scss";
import globals from "styles/globals.module.scss";
import { Variants } from "types/styleTypes";
import { clsx } from "clsx";

export interface ButtonProps {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  label?: string;
  labelStyle?: React.CSSProperties;
  variant?: Variants;
  className?: string;
  labelClassName?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export default function Button({
  children,
  style,
  label,
  labelStyle,
  variant = "light",
  className = "",
  labelClassName = "",
  onClick,
}: ButtonProps) {
  return (
    <button
      className={clsx(
        styles.button,
        globals[`${variant}BackgroundColorDynamic`],
        className,
        label && globals.doublePaddingHorizontal,
      )}
      style={style}
      onClick={onClick ? onClick : () => {}}
    >
      {label && (
        <p
          className={clsx(
            styles.label,
            labelClassName,
            globals[`${variant}TextColor`],
          )}
          style={labelStyle}
        >
          {label}
        </p>
      )}
      {children}
    </button>
  );
}
