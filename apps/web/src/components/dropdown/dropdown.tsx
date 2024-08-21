"use client";

import React, { useState } from "react";
import styles from "./dropdown.module.scss";
import { ButtonProps } from "components/button/button";
import clsx from "clsx";
import globals from "styles/globals.module.scss";
import Button from "components/button";
import { inverseTextColor, textColor, Variants } from "types/styleTypes";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

interface RadioGroupProps {
  style?: React.CSSProperties;
  optionStyle?: React.CSSProperties;
  selectButtonStyle?: React.CSSProperties;
  variant?: Variants;
  placeholder?: string;
  label?: string;
  labelVariant?: Variants;
  labelStyle?: React.CSSProperties;
  options: ButtonProps[];
  onSelect?: (index: number) => void;
}

export default function RadioGroup({
  style,
  optionStyle,
  selectButtonStyle,
  variant = "light",
  placeholder = "select",
  label,
  labelVariant,
  labelStyle,
  options,
  onSelect,
}: RadioGroupProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [isDropped, setIsDropped] = useState<boolean>(false);
  const [animate, setAnimate] = useState<boolean>(false);

  const changeDrop = () => {
    setAnimate(true);
    setIsDropped((prev) => !prev);
  };

  const handleSelect = (index: number) => {
    if (index == selected) setSelected(null);
    else setSelected(index);
    setIsDropped(false);
    onSelect && onSelect(index);
  };

  return (
    <div style={style} className={styles.wrapper}>
      <div className={styles.innerWrapper}>
        {label && (
          <p
            className={clsx(
              globals[
                `${labelVariant ? labelVariant : inverseTextColor(variant)}MutedColor`
              ],
              styles.label,
            )}
            style={labelStyle}
          >
            {label}
          </p>
        )}
        <div className={styles.select}>
          <Button
            variant={variant}
            label={selected !== null ? options[selected].label : placeholder}
            onClick={changeDrop}
            style={{ ...selectButtonStyle }}
            className={clsx(styles.fullWidth, isDropped && styles.selectButton)}
            labelClassName={globals.textAlignLeft}
          >
            <ArrowRightIcon
              className={clsx(
                isDropped && styles.selectArrowRotated,
                styles.selectArrow,
              )}
            />
          </Button>
        </div>
        <div
          className={clsx(
            animate
              ? isDropped
                ? styles.unhiddenAnimation
                : styles.hiddenAnimation
              : styles.hidden,
            styles.options,
            globals[`${variant}MutedBackgroundColor`],
          )}
        >
          {options.map((option, index) => (
            <div
              className={clsx(
                animate
                  ? isDropped
                    ? styles.unhiddenAnimation
                    : styles.hiddenAnimation
                  : styles.hidden,
                styles.option,
              )}
            >
              <Button
                key={index}
                label={option.label}
                variant={selected === index ? textColor(variant) : variant}
                style={optionStyle}
                onClick={() => handleSelect(index)}
                className={clsx(
                  styles.fullWidth,
                  animate
                    ? isDropped
                      ? styles.unhiddenAnimation
                      : styles.hiddenAnimation
                    : styles.hidden,
                )}
                labelClassName={globals.textAlignLeft}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
