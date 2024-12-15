"use client";

import { useState } from "react";
import styles from "./checkboxGroup.module.scss";
import Checkbox from "components/checkbox";
import { CheckboxProps } from "components/checkbox/checkbox";
import { useFormContext } from "react-hook-form";

interface CheckboxGroupProps {
  style?: React.CSSProperties;
  buttonStyle?: React.CSSProperties;
  labelStyle?: React.CSSProperties;
  checkboxes: CheckboxProps[];
  name?: string;
  isReactHookForm?: boolean;
  reactFormHookProps?: Object;
}

export default function CheckboxGroup({
  style,
  buttonStyle,
  labelStyle,
  checkboxes,
  name,
  isReactHookForm = false,
  reactFormHookProps,
}: CheckboxGroupProps) {
  const [indexes, setIndexes] = useState<number[]>([]);
  const methods = useFormContext();

  const handleClick = (_index: number) => {
    if (indexes.includes(_index)) {
      setIndexes((prevIndexes) => {
        const elements = prevIndexes.filter((index) => index !== _index);
        name &&
          isReactHookForm &&
          methods.setValue(name, elements, {
            shouldValidate: true,
            shouldDirty: true,
          });
        return elements;
      });

      return;
    }

    setIndexes((_indexes) => {
      const elements = [..._indexes, _index];
      name &&
        isReactHookForm &&
        methods.setValue(name, elements, {
          shouldValidate: true,
          shouldDirty: true,
        });
      return elements;
    });
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
              key={button.label || ""}
              isSelected={indexes.includes(_index)}
            />
          </div>
        );
      })}
    </div>
  );
}
