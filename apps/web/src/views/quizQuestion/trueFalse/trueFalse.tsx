"use client";

import { clsx } from "clsx";
import Button from "components/button";
import { useState } from "react";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import styles from "./trueFalse.module.scss";

export default function TrueFalseQuestion({
  image,
  correctAnswer,
  question,
  explanation,
  order,
}: {
  image?: string;
  correctAnswer?: boolean;
  question?: string;
  explanation?: string;
  order?: number;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const [userAnswer, setUserAnswer] = useState<boolean | undefined>(undefined);

  const handleAnswer = (ans: boolean) => {
    setUserAnswer(ans);
  };

  return (
    <div className={styles.wrapper}>
      <div>
        {order && <p className={globals[`${textColorTheme}Color`]}>{order}.</p>}
        {image && <img src={image} className={styles.questionLogo} />}
        <h2
          className={clsx(
            globals.largeText,
            styles.header,
            globals[`${textColorTheme}Color`]
          )}
        >
          {question}
        </h2>
      </div>
      <div className={styles.actionButtons}>
        <Button
          label="true"
          variant="primary"
          disabled={userAnswer !== undefined}
          onClick={() => handleAnswer(true)}
          className={styles.actionButton}
        />
        <Button
          label="false"
          variant="danger"
          disabled={userAnswer !== undefined}
          onClick={() => handleAnswer(false)}
          className={styles.actionButton}
        />
      </div>
      <div>
        {userAnswer !== undefined && userAnswer === correctAnswer ? (
          <div className={styles.correctAnswer}>
            <p
              className={clsx(
                globals.largeText,
                globals[`${textColorTheme}Color`]
              )}
            >
              correct!
            </p>
          </div>
        ) : userAnswer !== undefined && userAnswer !== correctAnswer ? (
          <div className={styles.wrongAnswer}>
            <p
              className={clsx(
                globals.largeText,
                globals[`${textColorTheme}Color`]
              )}
            >
              incorrect!
            </p>
            {explanation && (
              <p
                className={clsx(
                  styles.explanation,
                  globals[`${textColorTheme}Color`]
                )}
              >
                {explanation}
              </p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
