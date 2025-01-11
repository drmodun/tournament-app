"use client";

import styles from "./manageSettings.module.scss";
import globals from "styles/globals.module.scss";
import { clsx } from "clsx";
import Button from "components/button";
import { useState } from "react";
import { useThemeContext } from "utils/hooks/useThemeContext";
import CheckboxGroup from "components/checkboxGroup";
import { CheckboxProps } from "components/checkbox/checkbox";
import { textColor } from "types/styleTypes";

export default function ManageSettings() {
  const { theme, setTheme } = useThemeContext();
  const [activeCheckboxes, setActiveCheckboxes] = useState<boolean[]>([
    false,
    false,
    false,
  ]);

  const checkboxes: CheckboxProps[] = [
    { label: "updates about your team", variant: theme, labelVariant: theme },
    {
      label: "updates about the events you follow",
      variant: theme,
      labelVariant: theme,
    },
    {
      label: "updates about the people / organizations you follow",
      variant: theme,
      labelVariant: theme,
    },
  ];

  const updateCheckbox = (index: number) => {
    setActiveCheckboxes((curr) => {
      curr[index] = !curr[index];
      return curr;
    });
    console.log(activeCheckboxes[index]);
    console.log(checkboxes[index].label);
  };

  const setLightTheme = () => setTheme("light");
  const setDarkTheme = () => setTheme("dark");

  const textColorTheme = textColor(theme);

  return (
    <div
      className={clsx(
        styles.wrapper,
        globals[`${textColorTheme}BackgroundColor`]
      )}
    >
      <div className={styles.setting}>
        <p className={clsx(styles.settingLabel, globals[`${theme}Color`])}>
          theme
        </p>
        <div className={styles.options}>
          <Button label="light" variant={"light"} onClick={setLightTheme} />
          <Button label="dark" variant={"dark"} onClick={setDarkTheme} />
        </div>
      </div>
      <div className={styles.setting}>
        <p className={clsx(styles.settingLabel, globals[`${theme}Color`])}>
          send me notifications for:
        </p>
        <div className={styles.options}>
          <CheckboxGroup
            checkboxes={checkboxes.map((e, i) => {
              e.onSelect = () => updateCheckbox(i);
              return e;
            })}
          />
        </div>
      </div>
    </div>
  );
}
