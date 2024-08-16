"use client";

import React, { MouseEventHandler } from "react";
import styles from "./radioButton.module.scss";
import globals from "styles/globals.module.scss";
import { Variants, TextVariants } from "types/styleTypes";
import { clsx } from "clsx";

export interface RadioButtonProps {
  style?: React.CSSProperties;
  labelStyle?: React.CSSProperties;
  label?: string;
  variant?: Variants;
  labelVariant?: TextVariants;
  onSelect?: MouseEventHandler<HTMLDivElement>;
  disabled?: boolean;
  id?: string;
  isSelected?: boolean;
}

export default function RadioButton({
  style,
  labelStyle,
  label = "",
  variant = "light",
  labelVariant = "dark",
  onSelect = () => {},
  disabled = false,
  isSelected = false,
}: RadioButtonProps) {
  return (
    <div onClick={onSelect}>
      <label
        className={clsx(
          styles.label,
          disabled ? styles.disabledText : globals[`${labelVariant}Color`]
        )}
        htmlFor="radio"
      >
        <input
          className={clsx(
            styles.radioButton,
            isSelected && !disabled
              ? styles[`${variant}SelectedBorder`]
              : styles[`${variant}DeselectedBorder`],
            disabled && styles.disabled
          )}
          style={style}
          type="radio"
          disabled={disabled}
        />
        <p style={labelStyle}>{label}</p>
      </label>
    </div>
  );
}
