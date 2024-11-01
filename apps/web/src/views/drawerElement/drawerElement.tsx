"use client";

import React, { useState } from "react";
import styles from "./drawerElement.module.scss";
import { clsx } from "clsx";
import { TextVariants } from "types/styleTypes";
import { useDrawerContext } from "utils/hooks/useDrawerContext";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { SvgIconTypeMap } from "@mui/material";
import Link from "next/link";

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

  const handleClick = () => drawerContext.setDrawerOpen(false);

  return (
    <Link
      href={href}
      className={styles.link}
      style={{ textDecoration: "none" }}
      onClick={handleClick}
    >
      <div className={clsx(styles.wrapper, className)} style={style}>
        <p className={styles.label}>{label}</p>
        {icon &&
          React.createElement(icon, {
            className: clsx(styles.icon, styles[`${variant}Icon`]),
          })}
      </div>
    </Link>
  );
}
