"use client";

import { useEffect } from "react";
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
  onClose?: () => void;
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
    }

    return () => {
      clearAllBodyScrollLocks();
    };
  }, [active]);

  useEffect(() => {
    if (!active) return;

    const handleEscape = (evt: KeyboardEvent) => {
      if (evt.key === "Escape" && onClose) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [active, onClose]);

  if (!active) return null;

  return (
    <div
      className={styles.dialogWrapper}
      onClick={(e) => {
        onClose && onClose();
      }}
    >
      <div
        className={clsx(
          styles.dialog,
          globals[`${variant}BackgroundColor`],
          globals[`${textColor(variant)}TextColor`],
          className,
        )}
        style={style}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
