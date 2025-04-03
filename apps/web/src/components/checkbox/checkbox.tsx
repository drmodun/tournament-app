"use client";

import { clsx } from "clsx";
import { MouseEventHandler } from "react";
import globals from "styles/globals.module.scss";
import { Variants, textColor } from "types/styleTypes";
import styles from "./checkbox.module.scss";

export interface CheckboxProps {
  style?: React.CSSProperties;
  labelStyle?: React.CSSProperties;
  label?: string;
  variant?: Variants;
  labelVariant?: Variants;
  onSelect?: MouseEventHandler<HTMLDivElement>;
  disabled?: boolean;
  id?: string;
  isSelected?: boolean;
  mutable?: boolean;
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
  mutable = true,
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
          disabled={disabled || !mutable}
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
