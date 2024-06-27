"use client";

import React, { useState, MouseEventHandler } from "react";
import styles from "./button.module.scss";
import { Variants, Variant } from "../../types/styleTypes";

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
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const buttonVariant: Variant = new Variant(variant);

  const hover = () => {
    setIsHovered(true);
  };

  const leave = () => {
    setIsHovered(false);
  };

  return (
    <button
      className={styles.button}
      style={{
        ...style,
        backgroundColor: isHovered
          ? buttonVariant.mutedColor()
          : buttonVariant.color(),
        color: buttonVariant.textColor(),
      }}
      onMouseEnter={hover}
      onMouseLeave={leave}
      onClick={onClick ? onClick : () => {}}
    >
      <p className={styles.label}>{label}</p>
      {children}
    </button>
  );
}
