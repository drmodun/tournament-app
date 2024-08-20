"use client";

import React, { useState, MouseEventHandler } from "react";
import styles from "./chip.module.scss";
import globals from "styles/globals.module.scss";
import { Variants, textColor } from "types/styleTypes";
import { clsx } from "clsx";

interface ChipProps {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  label?: string;
  variant?: Variants;
  activeBorderVariant?: Variants;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export default function Chip({
  children,
  style,
  label,
  variant = "light",
  activeBorderVariant,
  onClick,
}: ChipProps) {
  const [isSelected, setIsSelected] = useState<boolean>(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    onClick && onClick(e);
    setIsSelected((prev) => !prev);
  };

  return (
    <button
      className={clsx(
        styles.chip,
        isSelected &&
          styles[
            `${activeBorderVariant ? activeBorderVariant : textColor(variant)}SelectedBorder`
          ],
        globals[`${textColor(variant)}Color`],
        isSelected
          ? globals[`${variant}BackgroundColor`]
          : globals[`${variant}MutedBackgroundColorDynamic`],
      )}
      style={style}
      onClick={handleClick}
    >
      <p className={styles.label}>{label}</p>
      {children}
    </button>
  );
}
