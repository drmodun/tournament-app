"use client";

import { MouseEventHandler } from "react";
import styles from "./cardExpanded.module.scss";
import globals from "styles/globals.module.scss";
import { textColor, TextVariants } from "types/styleTypes";
import { clsx } from "clsx";
import PeopleIcon from "@mui/icons-material/People";
import ArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  calculateBestFutureDateFormat,
  calculateBestValueFormat,
  formatDate,
} from "utils/mixins/formatting";
import Chip from "components/chip";
import FlagIcon from "@mui/icons-material/Flag";
import PublicIcon from "@mui/icons-material/Public";
import PlaceIcon from "@mui/icons-material/Place";

export interface CardExpandedProps {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  label?: string;
  labelStyle?: React.CSSProperties;
  variant?: TextVariants;
  className?: string;
  labelClassName?: string;
  participants?: number;
  viewers?: number;
  registrationTillDate?: number;
  startDate?: number;
  endDate?: number;
  organizerName?: string;
  tags?: string[];
  category?: string;
  image?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  location?: "offline" | "online" | "hybrid";
  locationDetails?: string;
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
  registrationTillDate,
  startDate,
  endDate,
  organizerName,
  tags,
  category,
  image,
  onClick,
  location,
  locationDetails,
}: CardExpandedProps) {
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
      <div className={styles.top}>
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
        <div className={styles.dates}>
          {registrationTillDate && (
            <Chip
              label={calculateBestFutureDateFormat(
                new Date(registrationTillDate),
              )}
              variant="primary"
            />
          )}
          {startDate && endDate && (
            <p
              className={globals[`${textColor(variant)}Color`]}
            >{`${formatDate(new Date(startDate))} - ${formatDate(new Date(endDate))}`}</p>
          )}
        </div>
        <div className={styles.dates}>
          {organizerName && (
            <Chip label={organizerName} variant="secondary">
              <FlagIcon className={clsx(globals.lightFill, styles.flagIcon)} />
            </Chip>
          )}
          {location &&
            (location == "offline" ? (
              <div className={styles.locationDetails}>
                <p className={globals[`${textColor(variant)}Color`]}>
                  {locationDetails?.toLowerCase()}
                </p>
                <PlaceIcon
                  className={clsx(globals.lightFill, styles.flagIcon)}
                />
              </div>
            ) : location == "online" ? (
              <div className={styles.locationDetails}>
                <p className={globals[`${textColor(variant)}Color`]}>online</p>
                <PublicIcon
                  className={clsx(globals.lightFill, styles.flagIcon)}
                />
              </div>
            ) : (
              <div className={styles.locationDetails}>
                <p className={globals[`${textColor(variant)}Color`]}>
                  {locationDetails?.toLowerCase()}
                </p>
                <PlaceIcon
                  className={clsx(globals.lightFill, styles.flagIcon)}
                />
                <p className={globals[`${textColor(variant)}Color`]}>
                  or online
                </p>
                <PublicIcon
                  className={clsx(globals.lightFill, styles.flagIcon)}
                />
              </div>
            ))}
        </div>
      </div>
      <div className={styles.bottomWrapper}>
        <div className={styles.tags}>
          <Chip
            key={"category"}
            label={category}
            variant={textColor(variant)}
          />
          {tags &&
            tags.map((tag) => <Chip key={tag} label={tag} variant={variant} />)}
        </div>

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
              <VisibilityIcon
                className={globals[`${textColor(variant)}Fill`]}
              />
            )}
            {viewers !== undefined && (
              <p className={clsx(globals[`${textColor(variant)}Color`])}>
                {calculateBestValueFormat(viewers)}
              </p>
            )}
          </div>
          <ArrowRightIcon className={globals[`${textColor(variant)}Fill`]} />
        </div>
      </div>
      <img src={image} alt={label} className={clsx(styles.image)} />
    </button>
  );
}
