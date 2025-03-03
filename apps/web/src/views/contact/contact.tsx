"use client";

import { clsx } from "clsx";
import Button from "components/button";
import MultilineInput from "components/multilineInput";
import { useState } from "react";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import styles from "./contact.module.scss";

export default function Contact() {
  const [inquiry, setInquiry] = useState<string>("");
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  return (
    <div className={styles.wrapper}>
      <div className={styles.leftContent}>
        <h1
          className={clsx(
            globals.titleText,
            styles.header,
            styles[`${textColorTheme}Header`],
          )}
        >
          contact us!
        </h1>
        <p className={clsx(styles.text, globals[`${textColorTheme}Color`])}>
          have any questions ❓ or need assistance 🤔? we're here to help and we
          look forward to hearing from you!
        </p>
      </div>
      <div></div>
      <div className={styles.rightContent}>
        <MultilineInput
          variant={textColorTheme}
          placeholder="your inquiry..."
          onChange={(e) => setInquiry(e.target.value)}
          className={styles.input}
        />
        <Button
          className={styles.button}
          label="send"
          disabled={inquiry == ""}
          variant="primary"
          onClick={() => {
            window.location.href = `mailto:winning.sh.info@gmail.com?body=${inquiry}`;
          }}
        />
      </div>
    </div>
  );
}
