"use client";

import { clsx } from "clsx";
import globals from "styles/globals.module.scss";
import { Variants, textColor } from "types/styleTypes";
import styles from "./tableData.module.scss";

interface TableDataProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  variant?: Variants;
  isHeader?: boolean;
}

export default function TableData({
  children,
  className,
  style,
  variant = "light",
  isHeader = false,
}: TableDataProps) {
  return (
    <td
      className={clsx(
        styles.td,
        isHeader
          ? globals[`${variant}MutedBackgroundColorDynamic`]
          : globals[`${variant}BackgroundColorDynamic`],
        isHeader && globals.textBold,
        globals[`${textColor(variant)}Color`],
        className,
      )}
      style={style}
    >
      {children}
    </td>
  );
}
