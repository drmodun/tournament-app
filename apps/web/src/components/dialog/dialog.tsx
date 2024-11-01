"use client";

import { MouseEventHandler, useEffect } from "react";
import styles from "./dialog.module.scss";
import globals from "styles/globals.module.scss";
import { Variants, textColor } from "types/styleTypes";
import { clsx } from "clsx";
import {
  disableBodyScroll,
  enableBodyScroll,
  clearAllBodyScrollLocks,
} from "body-scroll-lock";

interface DialogProps {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  variant?: Variants;
  active?: boolean;
  onClose?: MouseEventHandler;
}

export default function Dialog({
  children,
  style,
  className,
  variant = "light",
  active = false,
  onClose,
}: DialogProps) {
  useEffect(() => {
    if (active) {
      disableBodyScroll(document.body);
    } else {
      enableBodyScroll(document.body);
      clearAllBodyScrollLocks();
    }
  }, [active]);
  return (
    active && (
      <div
        className={styles.dialogWrapper}
        onClick={(e) => {
          onClose && onClose(e);
        }}
      >
        <div
          className={clsx(
            styles.dialog,
            globals[`${variant}BackgroundColor`],
            globals[`${textColor(variant)}Color`],
            className,
          )}
          style={style}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    )
  );
}
