"use client";

import React, {
  useState,
  HTMLInputTypeAttribute,
  ChangeEventHandler,
  useLayoutEffect,
  useRef,
} from "react";
import styles from "./input.module.scss";
import { Variants, Variant, TextVariants } from "../../types/styleTypes";

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
  labelVariant = "light",
  doesSubmit = false,
  submitLabel,
  type = "text",
  onChange = () => {},
  onSubmit = () => {},
}: InputProps) {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const inputVariant: Variant = new Variant(variant);
  const [value, setValue] = useState<string>("");
  const ref = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.style.setProperty("--placeholder-color", "red");
    }
  }, []);

  const hover = () => setIsHovered(true);
  const leave = () => setIsHovered(false);

  const select = () => setIsSelected(true);
  const unselect = () => setIsSelected(false);

  return (
    <div>
      {label ? (
        <p
          className={`${styles.label} ${styles["labelText-" + labelVariant]}`}
          style={labelStyle}
        >
          {label}
        </p>
      ) : null}
      <input
        ref={ref}
        type={type}
        onChange={(e) => {
          if (doesSubmit) setValue(e.target.value);
          onChange(e);
        }}
        value={value}
        placeholder={placeholder}
        className={`${styles.input} ${isSelected ? styles.selectedInput : ""} ${doesSubmit ? styles.submitInput : ""} ${variant == "light" ? styles.lightPlaceholder : ""}`}
        style={{
          backgroundColor:
            isSelected || isHovered
              ? inputVariant.mutedColor()
              : inputVariant.color(),
          color: inputVariant.textColor(),
          ...style,
        }}
        onMouseEnter={hover}
        onMouseLeave={leave}
        onSelect={select}
        onBlur={unselect}
      />
      {doesSubmit ? (
        <button
          onClick={() => onSubmit(value)}
          className={styles.submitButton}
          style={{
            backgroundColor: inputVariant.mutedColor(),
            color: inputVariant.textColor(),
            ...submitStyle,
          }}
        >
          {submitLabel}
        </button>
      ) : null}
    </div>
  );
  /*
  return (
    <button
      className={styles.button}
      style={{
        ...style,
        backgroundColor: isHovered
          ? buttonVariant.mutedColor()
          : buttonVariant.color(),
        color: buttonVariant.textColor(),
      }}
      onMouseEnter={hover}
      onMouseLeave={leave}
      onClick={onClick ? onClick : () => {}}
    >
      <p className={styles.label}>{label}</p>
      {children}
    </button>
  );
  */
}
