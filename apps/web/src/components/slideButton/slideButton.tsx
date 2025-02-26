"use client";

import { useEffect, useState } from "react";
import styles from "./slideButton.module.scss";
import globals from "styles/globals.module.scss";
import { textColor, Variants } from "types/styleTypes";
import { clsx } from "clsx";
import { useFormContext } from "react-hook-form";

export interface SlideButtonProps {
  style?: React.CSSProperties;
  label?: string;
  labelStyle?: React.CSSProperties;
  variant?: Variants;
  className?: string;
  labelClassName?: string;
  onChange?: (val: string) => void;
  disabled?: boolean;
  options: string[];
  name?: string;
  isReactFormHook?: boolean;
  defaultValue?: string;
}

export default function SlideButton({
  style,
  label,
  labelStyle,
  variant = "light",
  className = "",
  labelClassName = "",
  onChange,
  disabled = false,
  options,
  name,
  isReactFormHook,
  defaultValue,
}: SlideButtonProps) {
  const [selected, setSelected] = useState<number>(0);
  const methods = useFormContext();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    setSelected((prev) => {
      const index = (prev + 1) % options.length;
      onChange && onChange(options[index]);

      name &&
        isReactFormHook &&
        methods.setValue(name, options[index], {
          shouldValidate: true,
          shouldDirty: true,
        });

      return index;
    });
  };

  useEffect(() => {
    if (name && isReactFormHook) {
      methods.register(name);
      methods.setValue(name, options[0], {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
    for (let i = 0; i < options.length; i++) {
      if (options[i] == defaultValue) {
        setSelected(i);
        name &&
          isReactFormHook &&
          methods.setValue(name, options[i], {
            shouldValidate: true,
            shouldDirty: true,
          });
      }
    }
  }, []);

  return (
    <button
      className={clsx(
        styles.slideButton,
        disabled && styles.disabled,
        disabled
          ? globals.disabledBackgroundColor
          : globals[`${variant}BackgroundColor`],

        className,
        label && globals.doublePaddingHorizontal,
      )}
      style={style}
      onClick={handleClick}
      disabled={disabled}
    >
      {options.map((option, i) => (
        <div
          key={i}
          className={clsx(
            styles.option,
            globals[
              `${variant + (selected == i ? "Muted" : "")}BackgroundColor`
            ],
          )}
        >
          <p
            className={clsx(
              labelClassName,
              styles.optionText,
              globals[`${textColor(variant)}Color`],
            )}
            style={labelStyle}
          >
            {option}
          </p>
        </div>
      ))}
    </button>
  );
}
