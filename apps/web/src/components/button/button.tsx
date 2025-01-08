"use client";

import { MouseEventHandler } from "react";
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
  submit?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

export default function Button({
  children,
  style,
  label,
  labelStyle,
  variant = "light",
  className = "",
  labelClassName = "",
  submit = false,
  onClick,
  disabled = false,
}: ButtonProps) {
  return (
    <button
      className={clsx(
        styles.button,
        disabled && styles.disabled,
        disabled
          ? globals.disabledBackgroundColor
          : globals[`${variant}BackgroundColorDynamic`],

        className,
        label && globals.doublePaddingHorizontal,
      )}
      style={style}
      onClick={onClick && !disabled ? onClick : () => {}}
      type={submit ? "submit" : "button"}
      disabled={disabled}
    >
      {label && (
        <p
          className={clsx(
            styles.label,
            labelClassName,
            disabled ? globals.lightColor : globals[`${variant}TextColor`],
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
