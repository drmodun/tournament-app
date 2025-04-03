"use client";

import { clsx } from "clsx";
import {
  ChangeEventHandler,
  HTMLInputTypeAttribute,
  useEffect,
  useState,
} from "react";
import { Controller, useFormContext } from "react-hook-form";
import globals from "styles/globals.module.scss";
import {
  TextVariants,
  Variants,
  inverseTextColor,
  textColor,
} from "types/styleTypes";
import styles from "./input.module.scss";

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
  min?: string;
  max?: string;
  step?: string;
  defaultValue?: string;
  fullClassName?: string;
  doesSubmitReactHookForm?: boolean;
  autocomplete?: string;
  controlledValue?: string;
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
  min,
  max,
  step,
  defaultValue,
  fullClassName,
  doesSubmitReactHookForm = false,
  autocomplete = "on",
  controlledValue,
}: InputProps) {
  const [value, setValue] = useState<string>("");
  const methods = useFormContext();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    onChange(e);
  };

  return (
    <div className={fullClassName}>
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
      <div className={styles.inputWrapper}>
        {isReactFormHook ? (
          <Controller
            name={name}
            defaultValue={defaultValue}
            render={() => (
              <input
                type={type}
                placeholder={placeholder}
                className={clsx(
                  type == "range" && styles.slider,
                  styles.input,
                  className,
                  doesSubmit && styles.submitInput,
                  variant == "light" && styles.lightPlaceholder,
                  globals[`${variant}BackgroundColorDynamic`],
                  globals[`${textColor(variant)}Color`],
                )}
                min={min}
                max={max}
                style={style}
                step={step}
                autoComplete={autocomplete}
                {...methods.register(name, {
                  required: required,
                  onChange: handleChange,
                  ...reactFormHookProps,
                })}
              />
            )}
          />
        ) : (
          <input
            type={type}
            value={
              (controlledValue ?? value) == ""
                ? defaultValue
                : controlledValue ?? value
            }
            placeholder={placeholder}
            className={clsx(
              type == "range" && styles.slider,
              styles.input,
              className,
              doesSubmit && styles.submitInput,
              variant == "light" && styles.lightPlaceholder,
              globals[`${variant}BackgroundColorDynamic`],
              globals[`${textColor(variant)}Color`],
            )}
            min={min}
            max={max}
            style={style}
            step={step}
            onChange={handleChange}
            autoComplete={autocomplete}
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
            type={doesSubmitReactHookForm ? "submit" : "button"}
          >
            {submitLabel}
          </button>
        )}
      </div>
    </div>
  );
}
