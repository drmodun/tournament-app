"use client";

import React, {
  useState,
  HTMLInputTypeAttribute,
  ChangeEventHandler,
} from "react";
import styles from "./input.module.scss";
import globals from "styles/globals.module.scss";
import {
  Variants,
  TextVariants,
  textColor,
  inverseTextColor,
} from "types/styleTypes";
import { clsx } from "clsx";

interface InputProps {
  style?: React.CSSProperties;
  submitStyle?: React.CSSProperties;
  labelStyle?: React.CSSProperties;
  label?: string;
  placeholder?: string;
  variant?: Variants;
  labelVariant?: TextVariants;
  doesSubmit?: boolean;
  submitLabel?: string;
  type?: HTMLInputTypeAttribute;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onSubmit?: Function;
}

export default function Input({
  style,
  submitStyle,
  labelStyle,
  label,
  placeholder = "",
  variant = "light",
  labelVariant,
  doesSubmit = false,
  submitLabel,
  type = "text",
  onChange = () => {},
  onSubmit = () => {},
}: InputProps) {
  const [value, setValue] = useState<string>("");

  return (
    <div>
      {label && (
        <p
          className={clsx(
            globals[`${labelVariant ?? inverseTextColor(variant)}MutedColor`],
            styles.label,
          )}
          style={labelStyle}
        >
          {label}
        </p>
      )}
      <div className={styles.inputWrapper}>
        <input
          type={type}
          onChange={(e) => {
            if (doesSubmit) setValue(e.target.value);
            onChange(e);
          }}
          value={value}
          placeholder={placeholder}
          className={clsx(
            styles.input,
            doesSubmit && styles.submitInput,
            variant == "light" && styles.lightPlaceholder,
            globals[`${variant}BackgroundColorDynamic`],
            globals[`${textColor(variant)}Color`],
          )}
          style={style}
        />
        {doesSubmit && (
          <button
            onClick={() => onSubmit(value)}
            className={clsx(
              styles.submitButton,
              globals[`${textColor(variant)}Color`],
              globals[`${variant}MutedBackgroundColor`],
            )}
            style={submitStyle}
          >
            {submitLabel}
          </button>
        )}
      </div>
    </div>
  );
}
