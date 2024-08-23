"use client";

import styles from "./progressWheel.module.scss";
import globals from "styles/globals.module.scss";
import { clsx } from "clsx";
import React from "react";
import {
  inverseTextColor,
  textColor,
  TextVariants,
  Variants,
} from "types/styleTypes";

interface ProgressWheelProps {
  style?: React.CSSProperties;
  variant?: Variants;
  wheelVariant?: TextVariants;
  label?: string;
  labelVariant?: Variants;
  labelStyle?: React.CSSProperties;
  labelClassName?: string;
  className?: string;
}

export default function ProgressWheel({
  style,
  variant = "light",
  wheelVariant,
  label,
  labelVariant,
  labelStyle,
  labelClassName,
  className,
}: ProgressWheelProps) {
  return (
    <div className={clsx(className, styles.wrapper)} style={style}>
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        className={styles.svgCanvas}
      >
        <circle
          className={clsx(
            styles.bg,
            styles[`${wheelVariant ?? inverseTextColor(variant)}Stroke`],
          )}
          cx="32"
          cy="32"
          r="24"
          fill="none"
          strokeWidth="16"
        ></circle>
        <rect
          x="20"
          y="3"
          width="12"
          height="12"
          rx="24"
          ry="24"
          className={clsx(styles.box, styles[`${variant}Fill`])}
        ></rect>
      </svg>
      {label && (
        <p
          className={clsx(
            globals[`${labelVariant ?? textColor(variant)}MutedColor`],
            styles.label,
            labelClassName,
          )}
          style={labelStyle}
        >
          {label}
        </p>
      )}
    </div>
  );
}
