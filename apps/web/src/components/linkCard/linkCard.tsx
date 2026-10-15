"use client";

import { clsx } from "clsx";
import getUnicodeFlagIcon from "country-flag-icons/unicode";
import Link from "next/link";
import globals from "styles/globals.module.scss";
import { textColor, TextVariants } from "types/styleTypes";
import { COUNTRY_NAMES_TO_CODES } from "utils/mixins/formatting";
import styles from "./linkCard.module.scss";

/** Compact link card (picture, name, flag and an optional detail line). */
export default function LinkCard({
  href,
  image,
  fallbackImage,
  name,
  country,
  detail,
  variant,
}: {
  href: string;
  image?: string;
  fallbackImage: string;
  name?: string;
  country?: string;
  detail?: string;
  variant: TextVariants;
}) {
  const textColorTheme = textColor(variant);

  return (
    <Link
      href={href}
      className={clsx(
        styles.noTextDecoration,
        styles.userCardLink,
        globals[`${textColorTheme}BackgroundColor`],
      )}
    >
      <div className={styles.userCardInnerWrapper}>
        <img
          src={image ?? fallbackImage}
          className={styles.userCardProfilePicture}
          onError={(e) => {
            e.currentTarget.src = fallbackImage;
          }}
        />
        <div
          className={clsx(
            globals[`${variant}Color`],
            styles.userCardTextWrapper,
          )}
          title={name}
        >
          <b className={styles.userCardText}>{name} </b>
          <p className={styles.userCardText}>
            {country &&
              getUnicodeFlagIcon(COUNTRY_NAMES_TO_CODES[country] ?? "ZZ")}
          </p>
          {detail !== undefined && (
            <p className={styles.userCardText}>{detail}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
