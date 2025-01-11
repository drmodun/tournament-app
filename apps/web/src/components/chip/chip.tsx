"use client";

import { useState, MouseEventHandler } from "react";
import styles from "./chip.module.scss";
import globals from "styles/globals.module.scss";
import { Variants, textColor } from "types/styleTypes";
import { clsx } from "clsx";

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
        className,
        styles.chip,
        globals[`${variant}BackgroundColorDynamic`]
      )}
      style={style}
      onClick={handleClick}
    >
      {children}
      <p className={clsx(styles.label, globals[`${textColor(variant)}Color`])}>
        {label}
      </p>
    </button>
  );
}



