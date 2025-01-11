"use client";

import React from "react";
import styles from "./drawerElement.module.scss";
import globals from "styles/globals.module.scss";
import { clsx } from "clsx";
import { textColor, TextVariants, Variants } from "types/styleTypes";
import { useDrawerContext } from "utils/hooks/useDrawerContext";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { SvgIconTypeMap } from "@mui/material";
import Link from "next/link";
import { useThemeContext } from "utils/hooks/useThemeContext";

export interface DrawerElementProps {
  style?: React.CSSProperties;
  variant?: TextVariants;
  className?: string;
  icon?: OverridableComponent<SvgIconTypeMap<{}, "svg">>;
  label?: string;
  href?: string;
}

export default function DrawerElement({
  style,
  variant = "light",
  className,
  icon,
  label = "",
  href = "/",
}: DrawerElementProps) {
  const drawerContext = useDrawerContext();
  const { theme } = useThemeContext();

  const handleClick = () => drawerContext.setDrawerOpen(false);

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
            className: clsx(styles.icon, styles[`${variant}Icon`]),
          })}
      </div>
    </Link>
  );
}
