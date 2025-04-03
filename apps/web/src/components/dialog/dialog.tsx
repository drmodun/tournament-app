"use client";

import {
  clearAllBodyScrollLocks,
  disableBodyScroll,
  enableBodyScroll,
} from "body-scroll-lock";
import { clsx } from "clsx";
import { useCallback, useEffect } from "react";
import globals from "styles/globals.module.scss";
import { Variants, textColor } from "types/styleTypes";
import styles from "./dialog.module.scss";
import { useSpring, animated, useTransition } from "@react-spring/web";

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

  const handleEscKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    },
    [onClose],
  );

  const handlePopState = useCallback(
    (event: PopStateEvent) => {
      event.preventDefault();
      onClose?.();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("keyup", handleEscKey, false);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("keyup", handleEscKey, false);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [handleEscKey, handlePopState]);

  const transition = useTransition(active, {
    from: {
      scale: 0,
      opacity: 0,
    },
    enter: {
      scale: 1,
      opacity: 1,
    },
    leave: {
      scale: 0,
      opacity: 0,
    },
  });

  if (!active) return null;

  return (
    <div
      className={styles.dialogWrapper}
      onClick={() => {
        onClose && onClose();
      }}
    >
      {transition((_style, _active) => {
        return (
          _active && (
            <animated.div
              className={clsx(
                styles.dialog,
                globals[`${variant}BackgroundColor`],
                globals[`${textColor(variant)}TextColor`],
                className,
              )}
              style={{ ...style, ..._style }}
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </animated.div>
          )
        );
      })}
    </div>
  );
}
