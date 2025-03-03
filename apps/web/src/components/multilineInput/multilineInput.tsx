"use client";

import { clsx } from "clsx";
import { ChangeEventHandler } from "react";
import { useFormContext } from "react-hook-form";
import globals from "styles/globals.module.scss";
import {
  TextVariants,
  Variants,
  inverseTextColor,
  textColor,
} from "types/styleTypes";
import styles from "./multilineInput.module.scss";

interface MultilineInputProps {
  style?: React.CSSProperties;
  className?: string;
  labelStyle?: React.CSSProperties;
  label?: string;
  placeholder?: string;
  variant?: Variants;
  labelVariant?: TextVariants;
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
  isReactFormHook?: boolean;
  reactFormHookProps?: Object;
  required?: boolean;
  name?: string;
  defaultValue?: string;
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
  isReactFormHook = false,
  reactFormHookProps,
  required = false,
  name,
  defaultValue,
}: MultilineInputProps) {
  const methods = useFormContext();
  return (
    <div>
      {label && (
        <p
          className={clsx(
            globals[`${labelVariant ?? inverseTextColor(variant)}MutedColor`],
            globals.label,
          )}
          style={labelStyle}
        >
          {label}
        </p>
      )}
      {isReactFormHook ? (
        <textarea
          placeholder={placeholder}
          className={clsx(
            className,
            styles.input,
            variant == "light" && styles.lightPlaceholder,
            globals[`${variant}BackgroundColorDynamic`],
            globals[`${textColor(variant)}Color`],
          )}
          style={style}
          {...methods.register(name ?? "", {
            required: required,
            onChange: onChange,
            ...reactFormHookProps,
          })}
          defaultValue={defaultValue}
        />
      ) : (
        <textarea
          placeholder={placeholder}
          className={clsx(
            className,
            styles.input,
            variant == "light" && styles.lightPlaceholder,
            globals[`${variant}BackgroundColorDynamic`],
            globals[`${textColor(variant)}Color`],
          )}
          style={style}
          onChange={onChange}
          name={name}
        />
      )}
    </div>
  );
}
