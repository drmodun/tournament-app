"use client";

import { ChangeEventHandler } from "react";
import styles from "./multilineInput.module.scss";
import globals from "styles/globals.module.scss";
import {
  Variants,
  TextVariants,
  textColor,
  inverseTextColor,
} from "types/styleTypes";
import { clsx } from "clsx";

interface MultilineInputProps {
  style?: React.CSSProperties;
  className?: string;
  labelStyle?: React.CSSProperties;
  label?: string;
  placeholder?: string;
  variant?: Variants;
  labelVariant?: TextVariants;
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
}

export default function Input({
  style,
  className,
  labelStyle,
  label,
  placeholder = "",
  variant = "light",
  labelVariant,
  onChange = () => {},
}: MultilineInputProps) {
  return (
    <div>
      {label && (
        <p
          className={clsx(
            globals[`${labelVariant ?? inverseTextColor(variant)}MutedColor`],
            globals.label
          )}
          style={labelStyle}
        >
          {label}
        </p>
      )}
      <textarea
        onChange={onChange}
        placeholder={placeholder}
        className={clsx(
          className,
          styles.input,
          variant == "light" && styles.lightPlaceholder,
          globals[`${variant}BackgroundColorDynamic`],
          globals[`${textColor(variant)}Color`]
        )}
        style={style}
      />
    </div>
  );
}
