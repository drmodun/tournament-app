"use client";

import React, {
  useState,
  MouseEventHandler,
  ReactElement,
  JSXElementConstructor,
} from "react";
import styles from "./table.module.scss";
import { Variants, textColor } from "types/styleTypes";
import { clsx } from "clsx";

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
      return React.cloneElement(child as ReactElement, {
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
