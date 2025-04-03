"use client";

import RadioButton, {
  RadioButtonProps,
} from "components/radioButton/radioButton";
import { useState } from "react";
import styles from "./radioGroup.module.scss";

interface RadioGroupProps {
  style?: React.CSSProperties;
  buttonStyle?: React.CSSProperties;
  labelStyle?: React.CSSProperties;
  radioButtons: RadioButtonProps[];
  disabled?: boolean;
}

export default function RadioGroup({
  style,
  buttonStyle,
  labelStyle,
  radioButtons,
  disabled = false,
}: RadioGroupProps) {
  const [index, setIndex] = useState<number>(-1);

  return (
    <div style={style}>
      {radioButtons.map((button, _index) => {
        return (
          <div
            className={styles.radio}
            key={_index}
            onClick={() => !disabled && setIndex(_index)}
          >
            <RadioButton
              style={buttonStyle}
              label={button.label}
              labelStyle={labelStyle}
              variant={button.variant}
              labelVariant={button.labelVariant}
              onSelect={button.onSelect && button.onSelect}
              disabled={button.disabled}
              key={2 * _index}
              isSelected={index === _index}
            />
          </div>
        );
      })}
    </div>
  );
}
