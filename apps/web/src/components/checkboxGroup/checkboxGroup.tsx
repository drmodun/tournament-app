"use client";

import React, { useState } from "react";
import styles from "./checkboxGroup.module.scss";
import Checkbox from "components/checkbox";
import { CheckboxProps } from "components/checkbox/checkbox";

interface CheckboxGroupProps {
  style?: React.CSSProperties;
  buttonStyle?: React.CSSProperties;
  labelStyle?: React.CSSProperties;
  checkboxes: CheckboxProps[];
}

export default function CheckboxGroup({
  style,
  buttonStyle,
  labelStyle,
  checkboxes,
}: CheckboxGroupProps) {
  const [indexes, setIndexes] = useState<number[]>([]);

  const handleClick = (_index: number) => {
    if (indexes.includes(_index)) {
      setIndexes((prevIndexes) =>
        prevIndexes.filter((index) => index !== _index)
      );
      return;
    }

    setIndexes((_indexes) => [..._indexes, _index]);
  };

  return (
    <div style={style}>
      {checkboxes.map((button, _index) => {
        return (
          <div
            className={styles.radio}
            key={_index}
            onClick={() => handleClick(_index)}
          >
            <Checkbox
              style={buttonStyle}
              label={button.label}
              labelStyle={labelStyle}
              variant={button.variant}
              labelVariant={button.labelVariant}
              onSelect={button.onSelect && button.onSelect}
              disabled={button.disabled}
              key={2 * _index}
              isSelected={indexes.includes(_index)}
            />
          </div>
        );
      })}
    </div>
  );
}
