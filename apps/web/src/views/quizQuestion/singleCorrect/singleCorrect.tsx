"use client";

import { clsx } from "clsx";
import Button from "components/button";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";

import { ICreateQuizOptionDto } from "@tournament-app/types";
import RadioGroup from "components/radioGroup";
import { useState } from "react";
import { useThemeContext } from "utils/hooks/useThemeContext";
import styles from "./singleCorrect.module.scss";

export default function SingleCorrect({
  image,
  question,
  explanation,
  options,
  order,
}: {
  image?: string;
  question?: string;
  explanation?: string;
  options: ICreateQuizOptionDto[];
  order?: number;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const [userAnswer, setUserAnswer] = useState<number[] | undefined>(undefined);
  const [tempAnswer, setTempAnswer] = useState<number[] | undefined>(undefined);
  const [isCorrect, setIsCorrect] = useState<boolean | undefined>(undefined);

  const handleAnswer = () => {
    setUserAnswer(tempAnswer);
    for (let i = 0; i < options.length; i++) {
      if (
        (options[i].isCorrect && !tempAnswer?.includes(i)) ||
        (!options[i].isCorrect && tempAnswer?.includes(i))
      )
        setIsCorrect(false);
      else setIsCorrect(true);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div>
        {order && <p className={globals[`${textColorTheme}Color`]}>{order}.</p>}
        {image && (
          <img
            src={image}
            className={styles.questionLogo}
            onError={(e) => (image = undefined)}
          />
        )}
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
        <RadioGroup
          disabled={isCorrect !== undefined}
          radioButtons={options.map((option, index) => {
            return {
              label: option.option,
              onSelect: () =>
                setTempAnswer((prev) => {
                  if (prev === undefined) return [index];

                  if (prev.includes(index)) {
                    return prev.filter((elem) => elem !== index);
                  }

                  return [...prev, index];
                }),
              mutable: false,
              labelVariant:
                isCorrect === undefined
                  ? textColorTheme
                  : option.isCorrect
                    ? "primary"
                    : "danger",
              variant:
                isCorrect === undefined
                  ? textColorTheme
                  : option.isCorrect
                    ? "primary"
                    : "danger",
            };
          })}
        ></RadioGroup>
        <Button
          label="check answer"
          variant="primary"
          disabled={userAnswer !== undefined}
          onClick={() => handleAnswer()}
          className={styles.actionButton}
        />
      </div>
      <div>
        {isCorrect !== undefined && isCorrect ? (
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
        ) : isCorrect !== undefined && !isCorrect ? (
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
