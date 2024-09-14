"use client";

import styles from "./tooltip.module.scss";
import globals from "styles/globals.module.scss";
import React, { useState } from "react";
import { ANIMATION_DURATION, textColor, Variants } from "types/styleTypes";
import clsx from "clsx";

interface TooltipProps {
  style?: React.CSSProperties;
  className?: string;
  message?: string;
  messageStyle?: React.CSSProperties;
  messageClassName?: string;
  variant?: Variants;
  delay?: number;
  children?: React.ReactNode;
  direction?: "top" | "left" | "bottom" | "right";
}

export default function Tooltip({
  style,
  className,
  message = "",
  messageStyle,
  messageClassName,
  variant = "light",
  delay = ANIMATION_DURATION,
  children,
  direction = "top",
}: TooltipProps) {
  let fadeInTimeout: NodeJS.Timeout | undefined;
  let fadeOutTimeout: NodeJS.Timeout | undefined;
  const [active, setActive] = useState<boolean>(false);
  const [closingAnimationTrigger, setClosingAnimationTrigger] =
    useState<boolean>(false);

  const showTooltip = () => {
    setClosingAnimationTrigger(false);
    fadeInTimeout = setTimeout(() => {
      setActive(true);
    }, delay);
  };

  const hideTooltip = () => {
    setClosingAnimationTrigger(true);
    fadeInTimeout && clearInterval(fadeInTimeout);
    fadeOutTimeout = setTimeout(() => {
      setActive(false);
      clearInterval(fadeOutTimeout);
    }, delay);
  };

  return (
    <div
      className={styles.wrapper}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      {active && (
        <div
          style={style}
          className={clsx(
            className,
            globals[`${variant}BackgroundColor`],
            styles.tooltipWrapper,
            styles[direction],
            {
              [styles.fadeOut]: closingAnimationTrigger,
              [styles.fadeIn]: active,
            },
          )}
        >
          <p
            style={messageStyle}
            className={clsx(
              messageClassName,
              globals[`${textColor(variant)}Color`],
              styles.message,
            )}
          >
            {message}
          </p>
        </div>
      )}
    </div>
  );
}
