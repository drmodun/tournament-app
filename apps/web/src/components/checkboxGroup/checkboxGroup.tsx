"use client";

import Checkbox from "components/checkbox";
import { CheckboxProps } from "components/checkbox/checkbox";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import styles from "./checkboxGroup.module.scss";

interface CheckboxGroupProps {
  style?: React.CSSProperties;
  buttonStyle?: React.CSSProperties;
  labelStyle?: React.CSSProperties;
  checkboxes: CheckboxProps[];
  name?: string;
  isReactHookForm?: boolean;
  reactFormHookProps?: Object;
  defaultValues?: boolean[];
  disabled?: boolean;
}

export default function CheckboxGroup({
  style,
  buttonStyle,
  labelStyle,
  checkboxes,
  name,
  isReactHookForm = false,
  defaultValues,
  disabled = false,
}: CheckboxGroupProps) {
  const [indexes, setIndexes] = useState<number[]>([]);
  const methods = useFormContext();

  const reactFormHookValidation = (elements: number[]) => {
    name &&
      isReactHookForm &&
      methods.setValue(name, elements, {
        shouldValidate: true,
        shouldDirty: true,
      });
  };

  const handleClick = (_index: number) => {
    if (disabled) return;
    if (indexes.includes(_index)) {
      setIndexes((prevIndexes) => {
        const elements = prevIndexes.filter((index) => index !== _index);
        reactFormHookValidation(elements);
        return elements;
      });

      return;
    }

    setIndexes((_indexes) => {
      const elements = [..._indexes, _index];
      reactFormHookValidation(elements);
      return elements;
    });
  };

  useEffect(() => {
    if (defaultValues == undefined) return;

    for (let i = 0; i < defaultValues.length; i++) {
      if (!defaultValues[i]) continue;
      setIndexes((prevIndexes) => {
        const elements = [...prevIndexes, i];
        reactFormHookValidation(elements);
        return elements;
      });
    }
  }, []);

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
              key={button.label || _index}
              isSelected={indexes.includes(_index)}
            />
          </div>
        );
      })}
    </div>
  );
}
