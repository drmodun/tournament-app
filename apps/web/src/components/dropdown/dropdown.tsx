"use client";

import { ChangeEvent, useEffect, useState } from "react";
import styles from "./dropdown.module.scss";
import { ButtonProps } from "components/button/button";
import clsx from "clsx";
import globals from "styles/globals.module.scss";
import Button from "components/button";
import {
  inverseTextColor,
  textColor,
  TextVariants,
  Variants,
} from "types/styleTypes";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import Input from "components/input";
import { useFormContext } from "react-hook-form";

interface DropdownProps {
  style?: React.CSSProperties;
  optionStyle?: React.CSSProperties;
  optionWrapperStyle?: React.CSSProperties;
  optionClassName?: string;
  optionWrapperClassName?: string;
  selectButtonStyle?: React.CSSProperties;
  variant?: Variants;
  placeholder?: string;
  label?: string;
  labelVariant?: TextVariants;
  labelStyle?: React.CSSProperties;
  options?: ButtonProps[];
  // eslint-disable-next-line no-unused-vars
  onSelect?: (index: number) => void;
  children?: React.ReactNode;
  arrowed?: boolean;
  selectionBased?: boolean;
  doesSearch?: boolean;
  searchPlaceholder?: string;
  searchClassName?: string;
  name?: string;
  isReactHookForm?: boolean;
  reactFormHookProps?: Object;
  required?: boolean;
  optionsClassName?: string;
  innerWrapperClassName?: string;
  className?: string;
  defaultValue?: string;
}

export default function Dropdown({
  style,
  optionStyle,
  optionWrapperStyle,
  optionClassName,
  optionWrapperClassName,
  selectButtonStyle,
  variant = "light",
  placeholder = "",
  label,
  labelVariant,
  labelStyle,
  options = [],
  onSelect,
  children,
  arrowed = true,
  selectionBased = true,
  doesSearch = false,
  searchPlaceholder,
  searchClassName,
  name,
  isReactHookForm = false,
  reactFormHookProps,
  required = false,
  optionsClassName,
  innerWrapperClassName,
  className,
  defaultValue,
}: DropdownProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [isDropped, setIsDropped] = useState<boolean>(false);
  const [animate, setAnimate] = useState<boolean>(false);
  const [optionsActive, setOptionsActive] = useState<boolean[]>(
    new Array(options.length).fill(true),
  );
  const methods = useFormContext();

  if (isReactHookForm && name) {
    methods.register(name, {
      required: required,
    });
  }

  const changeDrop = () => {
    setAnimate(true);
    setIsDropped((prev) => !prev);
  };

  const handleSelect = (index: number) => {
    if (index == selected) {
      setSelected(null);
      isReactHookForm &&
        name &&
        methods.setValue(name, null, {
          shouldValidate: true,
          shouldDirty: true,
        });
    } else {
      setSelected(index);
      isReactHookForm &&
        name &&
        methods.setValue(name, options[index].label, {
          shouldValidate: true,
          shouldDirty: true,
        });
    }
    setIsDropped(false);
    onSelect && onSelect(index);
  };

  useEffect(() => {
    for (let i = 0; i < options.length; i++) {
      if (options[i].label === defaultValue) {
        setSelected(i);
        isReactHookForm &&
          name &&
          methods.setValue(name, options[i].label, {
            shouldValidate: true,
            shouldDirty: true,
          });
      }
    }
  }, []);

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    const search: string = event.target.value.toLowerCase();
    for (let option of options) {
      const optionLabel = option.label?.toLowerCase();
      if (optionLabel?.includes(search)) {
        setOptionsActive((prev) => {
          const newOptionsActive = [...prev];
          newOptionsActive[options.indexOf(option)] = true;
          return newOptionsActive;
        });
      } else {
        setOptionsActive((prev) => {
          const newOptionsActive = [...prev];
          newOptionsActive[options.indexOf(option)] = false;
          return newOptionsActive;
        });
      }
    }
  };

  return (
    <div style={style} className={clsx(styles.wrapper, className)}>
      <div className={clsx(styles.innerWrapper, innerWrapperClassName)}>
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
        <div className={styles.select}>
          <Button
            variant={variant}
            label={
              selected !== null && selectionBased
                ? options[selected].label
                : placeholder
            }
            onClick={changeDrop}
            style={selectButtonStyle}
            className={clsx(
              styles.fullWidth,
              isDropped && styles.selectButtonActive,
              styles.selectButton,
            )}
            labelClassName={globals.textAlignLeft}
          >
            {arrowed && (
              <ArrowRightIcon
                className={clsx(
                  isDropped && styles.selectArrowRotated,
                  styles.selectArrow,
                  styles[`${textColor(variant)}Fill`],
                )}
              />
            )}
            {children}
          </Button>
        </div>
        <div
          className={clsx(
            styles.optionsWrapper,
            isDropped && styles.zIndex,
            optionsClassName,
          )}
        >
          <div
            style={{ ...optionWrapperStyle, width: "100%" }}
            className={clsx(
              animate
                ? isDropped
                  ? styles.unhiddenAnimation
                  : styles.hiddenAnimation
                : styles.hidden,
              styles.options,

              globals[`${variant}MutedBackgroundColor`],
              optionWrapperClassName,
            )}
          >
            {doesSearch && (
              <Input
                placeholder={searchPlaceholder}
                variant={textColor(variant)}
                className={clsx(searchClassName, styles.search)}
                onChange={handleSearch}
              />
            )}

            {options.map((option, index) => (
              <div
                className={clsx(
                  !optionsActive[index] && globals.hidden,
                  animate
                    ? isDropped
                      ? styles.unhiddenAnimation
                      : styles.hiddenAnimation
                    : styles.hidden,

                  styles.option,
                  optionClassName,
                )}
              >
                <Button
                  key={index}
                  label={option.label}
                  variant={selected === index ? textColor(variant) : variant}
                  style={{ ...optionStyle }}
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
    </div>
  );
}
