"use client";

import React, { useState, MouseEventHandler } from "react";
import styles from "./chip.module.scss";
import { Variants, Variant, LIGHT, DARK } from "../../types/styleTypes";

interface ChipProps {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  label?: string;
  variant?: Variants;
  /// test
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
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const ChipVariant: Variant = new Variant(variant);

  const hover = () => {
    setIsHovered(true);
  };

  const leave = () => {
    setIsHovered(false);
  };

  const select = () => {
    setIsSelected(!isSelected);
  };

  return (
    <button
      className={styles.chip}
      style={{
        ...style,
        backgroundColor: isHovered
          ? ChipVariant.mutedColor()
          : ChipVariant.color(),
        color: ChipVariant.textColor(),
        boxShadow: isSelected
          ? `0px 0px 0px 4px ${activeBorderVariant ? new Variant(activeBorderVariant).color() : ChipVariant.textColor()} inset`
          : "",
      }}
      onMouseEnter={hover}
      onMouseLeave={leave}
      onClick={
        onClick
          ? (e) => {
              select();
              onClick(e);
            }
          : select
      }
    >
      <p className={styles.label}>{label}</p>
      {children}
    </button>
  );
}

/*
backgroundColor: isSelected
          ? isHovered
            ? ChipVariant.mutedColor()
            : ChipVariant.color()
          : isHovered
            ? ChipVariant.color()
            : ChipVariant.mutedColor(),
*/

/*
isSelected
          ? isHovered
            ? ChipVariant.mutedTextColor()
            : ChipVariant.color()
          : isHovered
            ? ChipVariant.mutedColor()
            : ChipVariant.textColor(),
        color: isSelected
          ? isHovered
            ? ChipVariant.textColor() == LIGHT
              ? DARK
              : LIGHT
            : ChipVariant.textColor()
          : isHovered
            ? ChipVariant.textColor()
            : ChipVariant.textColor() == LIGHT
              ? DARK
              : LIGHT,
*/
