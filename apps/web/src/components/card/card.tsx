"use client";

import { MouseEventHandler } from "react";
import styles from "./card.module.scss";
import globals from "styles/globals.module.scss";
import { textColor, TextVariants } from "types/styleTypes";
import { clsx } from "clsx";
import PeopleIcon from "@mui/icons-material/People";
import ArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { calculateBestValueFormat } from "utils/mixins/formatting";

export interface CardProps {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  label?: string;
  labelStyle?: React.CSSProperties;
  variant?: TextVariants;
  className?: string;
  labelClassName?: string;
  participants?: number;
  viewers?: number;
  image?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export default function Card({
  style,
  label,
  labelStyle,
  variant = "light",
  className = "",
  labelClassName = "",
  participants,
  viewers,
  image,
  onClick,
}: CardProps) {
  return (
    <button
      className={clsx(
        styles.card,
        styles[`${variant}Background`],
        className,
        globals.doublePaddingHorizontal,
        globals.paddingVertical,
      )}
      style={style}
      onClick={onClick ? onClick : () => {}}
    >
      <p
        className={clsx(
          styles.label,
          labelClassName,
          globals[`${variant}TextColor`],
        )}
        style={labelStyle}
      >
        {label}
      </p>

      <div className={styles.bottom}>
        <div className={styles.participants}>
          {participants !== undefined && (
            <PeopleIcon className={globals[`${textColor(variant)}Fill`]} />
          )}
          {participants !== undefined && (
            <p className={clsx(globals[`${textColor(variant)}Color`])}>
              {calculateBestValueFormat(participants)}
            </p>
          )}
          <div />
          {viewers !== undefined && (
            <VisibilityIcon className={globals[`${textColor(variant)}Fill`]} />
          )}
          {viewers !== undefined && (
            <p className={clsx(globals[`${textColor(variant)}Color`])}>
              {calculateBestValueFormat(viewers)}
            </p>
          )}
        </div>
        <ArrowRightIcon className={globals[`${textColor(variant)}Fill`]} />
      </div>
      <img src={image} alt={label} className={clsx(styles.image)} />
    </button>
  );
}
