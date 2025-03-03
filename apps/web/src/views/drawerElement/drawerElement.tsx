"use client";

import { SvgIconTypeMap } from "@mui/material";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { clsx } from "clsx";
import Link from "next/link";
import React from "react";
import globals from "styles/globals.module.scss";
import { textColor, TextVariants, Variants } from "types/styleTypes";
import { useDrawerContext } from "utils/hooks/useDrawerContext";
import { useThemeContext } from "utils/hooks/useThemeContext";
import styles from "./drawerElement.module.scss";

export interface DrawerElementProps {
  style?: React.CSSProperties;
  variant?: TextVariants;
  className?: string;
  icon?: OverridableComponent<SvgIconTypeMap<{}, "svg">>;
  label?: string;
  href?: string;
  onClick?: () => void;
}

export default function DrawerElement({
  style,
  variant,
  className,
  icon,
  label = "",
  href = "/",
  onClick,
}: DrawerElementProps) {
  const drawerContext = useDrawerContext();
  const { theme } = useThemeContext();

  const handleClick = () => {
    drawerContext.setDrawerOpen(false);
    onClick && onClick();
  };

  const colorTheme: Variants = variant ?? theme;
  const textColorTheme = textColor(colorTheme);

  return (
    <Link
      href={href}
      className={styles.link}
      style={{ textDecoration: "none" }}
      onClick={handleClick}
    >
      <div className={clsx(styles.wrapper, className)} style={style}>
        <p className={clsx(styles.label, globals[`${textColorTheme}Color`])}>
          {label}
        </p>
        {icon &&
          React.createElement(icon, {
            className: clsx(
              styles.icon,
              styles[`${variant}Icon`],
              globals[`${textColor(colorTheme)}FillChildren`],
            ),
          })}
      </div>
    </Link>
  );
}
