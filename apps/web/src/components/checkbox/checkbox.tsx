"use client";

import { MouseEventHandler } from "react";
import styles from "./checkbox.module.scss";
import globals from "styles/globals.module.scss";
import { Variants, TextVariants, textColor } from "types/styleTypes";
import { clsx } from "clsx";

export interface CheckboxProps {
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

export default function Checkbox({
  style,
  labelStyle,
  label = "",
  variant = "light",
  labelVariant,
  onSelect = () => {},
  disabled = false,
  isSelected = false,
}: CheckboxProps) {
  return (
    <div onClick={onSelect}>
      <label
        className={clsx(
          styles.label,
          disabled
            ? styles.disabledText
            : globals[`${labelVariant ?? textColor(variant)}Color`],
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
          type="checkbox"
          disabled={disabled}
        />
        {label && (
          <p
            style={labelStyle}
            className={globals[`${labelVariant ?? textColor(variant)}Color`]}
          >
            {label}
          </p>
        )}
      </label>
    </div>
  );
}
