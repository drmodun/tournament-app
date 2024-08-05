"use client";

import React, { useState } from "react";
import styles from "./radio_group.module.scss";
import RadioButton, { RadioButtonProps } from "../radio_button/radio_button";

interface RadioGroupProps {
  style?: React.CSSProperties;
  buttonStyle?: React.CSSProperties;
  radioButtons: RadioButtonProps[];
  onSelect?: (index: number) => void;
}

export default function RadioGroup({
  style,
  buttonStyle,
  radioButtons,
  onSelect = () => {},
}: RadioGroupProps) {
  const [index, setIndex] = useState<number>(-1);
  const id = Date.now().toString();

  return (
    <div style={style}>
      {radioButtons.map((button, _index) => {
        return (
          <div className={styles.radio}>
            <RadioButton
              style={buttonStyle}
              label={button.label}
              variant={button.variant}
              labelVariant={button.labelVariant}
              onSelect={() => {
                setIndex(_index);
                onSelect(_index);
              }}
              disabled={button.disabled}
              id={id}
              key={_index}
              isSelected={index === _index}
            />
          </div>
        );
      })}
    </div>
  );
}
