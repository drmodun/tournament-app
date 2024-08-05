"use client";

import React, { useState, MouseEventHandler } from "react";
import styles from "./radio_button.module.scss";
import { Variants, Variant, LIGHT, TextVariants } from "../../types/styleTypes";

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
  id,
  isSelected = false,
}: RadioButtonProps) {
  const [isActive, setisActive] = useState<boolean>(false);
  const radioButtonVariant: Variant = new Variant(variant);

  const activate = () => {
    setisActive(!isActive);
  };
  return (
    <div
      onClick={(e) => {
        onSelect(e);
        activate();
      }}
    >
      <label
        className={styles.label}
        style={{
          ...labelStyle,
          color: labelVariant,
        }}
        htmlFor="radio"
      >
        <input
          className={styles.radioButton}
          style={{
            ...style,
            color: LIGHT,
            border: isSelected
              ? `6px solid ${radioButtonVariant.color()}`
              : `2px solid ${radioButtonVariant.color()}`,
          }}
          type="radio"
          name={id ?? ""}
          id="radio"
          disabled={disabled}
        />
        {label}
      </label>
    </div>
  );
}
