"use client";

import React, { useState, MouseEventHandler, ReactElement } from "react";
import styles from "./tableRow.module.scss";
import globals from "styles/globals.module.scss";
import { Variants, textColor } from "types/styleTypes";
import { clsx } from "clsx";
import TableData from "components/tableData";

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  variant?: Variants;
  isNumbered?: boolean;
  index?: number;
}

export default function TableRow({
  children,
  className,
  style,
  variant = "light",
  isNumbered = false,
  index = -1,
}: TableRowProps) {
  const renderChildren = () => {
    return React.Children.map(children, (child) => {
      return React.cloneElement(child as ReactElement, {
        variant: variant,
      });
    });
  };

  return (
    <tr style={style} className={clsx(styles.tr, className)}>
      {isNumbered && (
        <TableData variant={variant} isHeader={index == -1}>
          {index == -1 ? "" : index}
        </TableData>
      )}
      {renderChildren()}
    </tr>
  );
}
