"use client";

import { useState } from "react";
import styles from "./contact.module.scss";
import globals from "styles/globals.module.scss";
import { clsx } from "clsx";
import Button from "components/button";
import MultilineInput from "components/multilineInput";

export default function Contact() {
  const [inquiry, setInquiry] = useState<string>("");
  return (
    <div className={styles.wrapper}>
      <div className={styles.leftContent}>
        <h1 className={clsx(globals.titleText, styles.header)}>contact us!</h1>
        <p className={clsx(styles.text)}>
          have any questions ❓ or need assistance 🤔? we're here to help and we
          look forward to hearing from you!
        </p>
      </div>
      <div></div>
      <div className={styles.rightContent}>
        <MultilineInput
          variant="light"
          placeholder="your inquiry..."
          onChange={(e) => setInquiry(e.target.value)}
          className={styles.input}
        />
        <Button
          className={styles.button}
          label="send"
          variant={inquiry != "" ? "primary" : "light"}
        />
      </div>
    </div>
  );
}
