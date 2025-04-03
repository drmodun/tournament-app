"use client";

import { clsx } from "clsx";
import { MouseEventHandler } from "react";
import globals from "styles/globals.module.scss";
import { TextVariants, Variants } from "types/styleTypes";
import styles from "./radioButton.module.scss";

export interface RadioButtonProps {
  style?: React.CSSProperties;
  labelStyle?: React.CSSProperties;
  label?: string;
  variant?: Variants;
  labelVariant?: Variants;
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
          disabled ? styles.disabledText : globals[`${labelVariant}Color`],
        )}
        htmlFor="radio"
      >
        <input
          className={clsx(
            styles.radioButton,
            isSelected && !disabled
              ? globals[`${variant}SelectedBorder`]
              : globals[`${variant}Border`],
            disabled && styles.disabled,
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
