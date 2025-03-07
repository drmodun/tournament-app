"use client";

import { clsx } from "clsx";
import TableData from "components/tableData";
import React from "react";
import { Variants } from "types/styleTypes";
import styles from "./tableRow.module.scss";

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
      if (!child) return null;
      return React.cloneElement(child as React.ReactElement, {
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
