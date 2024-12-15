"use client";

import { useState, HTMLInputTypeAttribute, ChangeEventHandler } from "react";
import styles from "./input.module.scss";
import globals from "styles/globals.module.scss";
import {
  Variants,
  TextVariants,
  textColor,
  inverseTextColor,
} from "types/styleTypes";
import { clsx } from "clsx";
import { useFormContext } from "react-hook-form";

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
  name?: string;
  isReactFormHook?: boolean;
  reactFormHookProps?: Object;
  required?: boolean;
  className?: string;
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
  name = "",
  isReactFormHook = false,
  reactFormHookProps = {},
  required = false,
  className,
  onChange = () => {},
  onSubmit = () => {},
}: InputProps) {
  const [value, setValue] = useState<string>("");
  const methods = useFormContext();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    onChange(e);
  };

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
        {isReactFormHook ? (
          <input
            type={type}
            value={value}
            placeholder={placeholder}
            className={clsx(
              styles.input,
              className,
              doesSubmit && styles.submitInput,
              variant == "light" && styles.lightPlaceholder,
              globals[`${variant}BackgroundColorDynamic`],
              globals[`${textColor(variant)}Color`],
            )}
            style={style}
            {...methods.register(name, {
              required: required,
              ...reactFormHookProps,
            })}
            onChange={handleChange}
          />
        ) : (
          <input
            type={type}
            value={value}
            placeholder={placeholder}
            className={clsx(
              styles.input,
              className,
              doesSubmit && styles.submitInput,
              variant == "light" && styles.lightPlaceholder,
              globals[`${variant}BackgroundColorDynamic`],
              globals[`${textColor(variant)}Color`],
            )}
            style={style}
            onChange={handleChange}
          />
        )}

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
