"use client";

import ArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import PeopleIcon from "@mui/icons-material/People";
import PlaceIcon from "@mui/icons-material/Place";
import PublicIcon from "@mui/icons-material/Public";
import { stageStatusEnumType, stageTypeEnumType } from "@tournament-app/types";
import { clsx } from "clsx";
import Chip from "components/chip";
import { useRouter } from "next/navigation";
import { MouseEventHandler } from "react";
import globals from "styles/globals.module.scss";
import { textColor, TextVariants } from "types/styleTypes";
import {
  calculateBestFutureDateFormat,
  calculateBestValueFormat,
  formatDateTime,
  STAGE_STATUS_VARIANT_MAP,
  STAGE_TYPE_NAME_MAP,
} from "utils/mixins/formatting";
import styles from "./stageCard.module.scss";

export interface StageCardProps {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  label?: string;
  labelStyle?: React.CSSProperties;
  variant?: TextVariants;
  className?: string;
  labelClassName?: string;
  participants?: number;
  startDate?: Date;
  endDate?: Date;
  category?: string;
  image?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  location?: "offline" | "online" | "hybrid";
  locationDetails?: string;
  id?: number;
  type?: stageTypeEnumType;
  status?: stageStatusEnumType;
}

export default function StageCard({
  style,
  label,
  labelStyle,
  variant = "light",
  className = "",
  labelClassName = "",
  participants,
  startDate,
  endDate,
  image,
  onClick,
  location,
  locationDetails,
  id,
  type,
  status,
}: StageCardProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick && onClick(e);

    if (id) router.push(`/contest/${id}`);
  };

  return (
    <button
      className={clsx(
        styles.card,
        styles[`${variant}Background`],
        className,
        globals.doublePaddingHorizontal,
        globals.paddingVertical
      )}
      style={style}
      onClick={handleClick}
    >
      <div className={styles.top}>
        <div className={styles.title}>
          <p
            className={clsx(
              styles.label,
              labelClassName,
              globals[`${variant}TextColor`]
            )}
            style={labelStyle}
          >
            {label}
          </p>
          {status && (
            <Chip
              label={status}
              variant={STAGE_STATUS_VARIANT_MAP[status]}
              className={styles.chip}
            />
          )}
        </div>
        {startDate && endDate && (
          <div className={styles.dates}>
            <Chip
              label={formatDateTime(new Date(startDate))}
              variant="primary"
            />
            <p className={globals[`${textColor(variant)}Color`]}>-</p>
            <Chip label={formatDateTime(new Date(endDate))} variant="primary" />
          </div>
        )}
        <div className={styles.dates}>
          {location &&
            (location == "offline" ? (
              <div className={styles.locationDetails}>
                <p className={globals[`${textColor(variant)}Color`]}>
                  {locationDetails?.toLowerCase()}
                </p>
                <PlaceIcon
                  className={clsx(
                    globals[`${textColor(variant)}FillChildren`],
                    styles.flagIcon
                  )}
                />
              </div>
            ) : location == "online" ? (
              <div className={styles.locationDetails}>
                <p className={globals[`${textColor(variant)}Color`]}>online</p>
                <PublicIcon
                  className={clsx(
                    globals[`${textColor(variant)}FillChildren`],
                    styles.flagIcon
                  )}
                />
              </div>
            ) : (
              <div className={styles.locationDetails}>
                <p className={globals[`${textColor(variant)}Color`]}>
                  {locationDetails?.toLowerCase()}
                </p>
                <PlaceIcon
                  className={clsx(
                    globals[`${textColor(variant)}FillChildren`],
                    styles.flagIcon
                  )}
                />
                <p className={globals[`${textColor(variant)}Color`]}>
                  or online
                </p>
                <PublicIcon
                  className={clsx(
                    globals[`${textColor(variant)}FillChildren`],
                    styles.flagIcon
                  )}
                />
              </div>
            ))}
        </div>
      </div>
      <div className={styles.bottomWrapper}>
        <div className={styles.tags}>
          {type && (
            <Chip
              key={"type"}
              label={STAGE_TYPE_NAME_MAP[type]}
              variant={textColor(variant)}
            />
          )}
        </div>

        <div className={styles.bottom}>
          <div className={styles.participants}>
            {participants !== undefined && (
              <PeopleIcon
                className={globals[`${textColor(variant)}FillChildren`]}
              />
            )}
            {participants !== undefined && (
              <p className={clsx(globals[`${textColor(variant)}Color`])}>
                {calculateBestValueFormat(participants)}
              </p>
            )}
            <div />
          </div>
          <ArrowRightIcon
            className={globals[`${textColor(variant)}FillChildren`]}
          />
        </div>
      </div>
      <img
        src={image ?? `/${variant}.png`}
        className={clsx(styles.image)}
        onError={(e) => (e.currentTarget.src = `/${variant}.png`)}
      />
    </button>
  );
}
