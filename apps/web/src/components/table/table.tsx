"use client";

import React, { useState, MouseEventHandler } from "react";
import styles from "./table.module.scss";
import globals from "styles/globals.module.scss";
import { Variants, textColor } from "types/styleTypes";
import { clsx } from "clsx";
import { isNumber } from "util";
import { TableRow } from "@mui/material";

interface TableProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  variant?: Variants;
  isNumbered?: boolean;
}

export default function Table({
  children,
  className,
  style,
  variant = "light",
  isNumbered = false,
}: TableProps) {
  const renderChildren = () => {
    return React.Children.map(children, (child, index) => {
      return React.cloneElement(child, {
        variant: variant,
        isNumbered: isNumbered,
        index: index == 0 ? -1 : index,
        className: styles.td_table,
      });
    });
  };

  return (
    <div className={styles.wrapper}>
      <table className={clsx(styles.table, className)} style={style}>
        {renderChildren()}
      </table>
    </div>
  );
}
