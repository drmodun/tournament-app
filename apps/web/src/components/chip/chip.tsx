"use client";

import { clsx } from "clsx";
import { MouseEventHandler } from "react";
import globals from "styles/globals.module.scss";
import { Variants, textColor } from "types/styleTypes";
import styles from "./chip.module.scss";

interface ChipProps {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  label?: string;
  variant?: Variants;
  activeBorderVariant?: Variants;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export default function Chip({
  children,
  style,
  className,
  label,
  variant = "light",
  onClick,
}: ChipProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    onClick && onClick(e);
  };

  return (
    <button
      className={clsx(
        className,
        styles.chip,
        globals[`${variant}BackgroundColorDynamic`],
      )}
      style={style}
      onClick={handleClick}
      type="button"
    >
      {children}
      <p className={clsx(styles.label, globals[`${textColor(variant)}Color`])}>
        {label}
      </p>
    </button>
  );
}
