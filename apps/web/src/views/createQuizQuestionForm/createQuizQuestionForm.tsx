"use client";

import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  ICreateQuizQuestionDto,
  quizQuestionTypeEnum,
  quizQuestionTypeEnumType,
} from "@tournament-app/types";
import { clsx } from "clsx";
import Button from "components/button";
import Dropdown from "components/dropdown";
import ImageDrop from "components/imageDrop";
import ImagePicker from "components/imagePicker";
import Input from "components/input";
import MultilineInput from "components/multilineInput";
import SlideButton from "components/slideButton";
import { Dispatch, SetStateAction, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import globals from "styles/globals.module.scss";
import { textColor, TextVariants } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { useToastContext } from "utils/hooks/useToastContext";
import styles from "./createQuizQuestionForm.module.scss";

export default function AddQuestionForm({
  setQuestions,
  onClose,
  variant,
}: {
  setQuestions?: Dispatch<SetStateAction<ICreateQuizQuestionDto[]>>;
  onClose?: () => void;
  variant?: TextVariants;
}) {
  const theme = variant ?? useThemeContext().theme;
  const textColorTheme = textColor(theme);

  const { addToast } = useToastContext();

  const [file, setFile] = useState<File>();
  const [coverImage, setCoverImage] = useState<string>();
  const [questionType, setQuestionType] = useState<quizQuestionTypeEnumType>();
  const [shortAnswers, setShortAnswers] = useState<string[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [correct, setCorrect] = useState<string[]>([]);
  const [timeLimit, setTimeLimit] = useState<number>();
  const [explanation, setExplanation] = useState<string>();
  const [points, setPoints] = useState<number>(1);
  const [question, setQuestion] = useState<string>();
  const [hours, setHours] = useState<number>(NaN);
  const [minutes, setMinutes] = useState<number>(NaN);
  const [seconds, setSeconds] = useState<number>(NaN);
  const [isImmediateFeedback, setIsImmediateFeedback] =
    useState<boolean>(false);

  const methods = useForm<ICreateQuizQuestionDto>();
  const onSubmit = async () => {
    if (!questionType || !question || options.length == 0) {
      addToast("invalid field values!", "error");
      return;
    }

    const data: ICreateQuizQuestionDto = {
      image: coverImage ?? null,
      question: question,
      questionType: questionType,
      ...((!Number.isNaN(hours) ||
        !Number.isNaN(minutes) ||
        !Number.isNaN(seconds)) && { timeLimit }),
      ...(options && {
        options: options.map((option) => {
          return { option, isCorrect: correct.includes(option) };
        }),
      }),
      ...(explanation && { explanation }),
      ...(points && { points }),
      ...(correct && {
        correctAnswers: options.filter((elem) => correct.includes(elem)),
      }),
      ...(isImmediateFeedback && { isImmediateFeedback }),
    };

    setQuestions && setQuestions((prev) => [...prev, data]);
    onClose && onClose();
  };

  const handleChangeTimeLimit = (
    seconds: number,
    minutes: number,
    hours: number,
  ) => {
    let val: number = 0;
    console.log(seconds, minutes, hours);
    if (!isNaN(hours)) val += hours * 3600;
    if (!isNaN(minutes)) val += minutes * 60;
    if (!isNaN(seconds)) val += seconds;
    console.log("test", val);
    setTimeLimit(val);
  };

  return (
    <FormProvider {...methods}>
      <div className={styles.wrapper}>
        <div className={styles.dialogOption}>
          <MultilineInput
            label="question"
            placeholder="enter question..."
            variant={theme}
            isReactFormHook={true}
            name="question"
            required={true}
            onChange={(e) => setQuestion(e.currentTarget.value)}
          />
        </div>
        <div className={styles.dialogOption}>
          <p className={clsx(globals.label, globals[`${theme}Color`])}>
            question type
          </p>

          <Dropdown
            variant={theme}
            placeholder="select question type"
            isReactHookForm={true}
            name="questionType"
            required={true}
            options={[
              { label: "true/false" },
              { label: "multiple choice" },
              { label: "short answer" },
            ]}
            onSelect={(index: number) => {
              switch (index) {
                case 0:
                  setQuestionType(quizQuestionTypeEnum.TRUE_FALSE);
                  break;
                case 1:
                  setQuestionType(quizQuestionTypeEnum.MULTIPLE_CHOICE);
                  break;
                case 2:
                  setQuestionType(quizQuestionTypeEnum.SHORT_ANSWER);
              }
            }}
          />
        </div>
        {(questionType === quizQuestionTypeEnum.TRUE_FALSE ||
          questionType === quizQuestionTypeEnum.MULTIPLE_CHOICE ||
          questionType === quizQuestionTypeEnum.SHORT_ANSWER) && (
          <div className={styles.dialogOption}>
            {questionType === quizQuestionTypeEnum.TRUE_FALSE ? (
              <>
                <p className={clsx(globals.label, globals[`${theme}Color`])}>
                  answer
                </p>
                <SlideButton
                  options={["false", "true"]}
                  variant={theme}
                  onChange={(val: string) => setCorrect([val])}
                />
              </>
            ) : questionType === quizQuestionTypeEnum.MULTIPLE_CHOICE ? (
              <div className={styles.manageAnswers}>
                <Input
                  placeholder="add option..."
                  label="option"
                  submitLabel="add"
                  variant={theme}
                  doesSubmit={true}
                  type="input"
                  onSubmit={(val: string) =>
                    !options.includes(val) &&
                    setOptions((prev) => [...prev, val])
                  }
                />
                <div className={styles.answers}>
                  {options.map((answer: string, index: number) => {
                    const isCorrect = correct.includes(answer);
                    return (
                      <div
                        className={clsx(
                          styles.option,
                          isCorrect
                            ? globals.primaryBackgroundColor
                            : globals[`${theme}BackgroundColor`],
                        )}
                      >
                        <p
                          className={
                            isCorrect
                              ? globals.lightColor
                              : globals[`${textColorTheme}Color`]
                          }
                        >
                          {answer}
                        </p>
                        <div className={styles.optionActionButtons}>
                          {!isCorrect ? (
                            <Button
                              variant="primary"
                              onClick={() =>
                                setCorrect((prev) => [answer, ...prev])
                              }
                              className={styles.actionButton}
                            >
                              <CheckIcon
                                className={clsx(globals.lightFillChildren)}
                              />
                            </Button>
                          ) : (
                            <Button
                              variant="warning"
                              onClick={() =>
                                setCorrect((prev) =>
                                  prev.filter((elem) => elem !== answer),
                                )
                              }
                              className={styles.actionButton}
                            >
                              <CloseIcon
                                className={clsx(globals.lightFillChildren)}
                              />
                            </Button>
                          )}
                          <Button
                            variant="danger"
                            onClick={() => {
                              if (isCorrect) {
                                setCorrect((prev) =>
                                  prev.filter((elem) => elem !== answer),
                                );
                              }

                              setOptions((prev) =>
                                prev.filter((elem) => elem != answer),
                              );
                            }}
                            className={styles.actionButton}
                          >
                            <DeleteIcon
                              className={clsx(globals.lightFillChildren)}
                            />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className={styles.manageAnswers}>
                <Input
                  placeholder="add answer..."
                  label="answer"
                  submitLabel="add"
                  variant={theme}
                  doesSubmit={true}
                  type="input"
                  onSubmit={(val: string) =>
                    !shortAnswers.includes(val) &&
                    setShortAnswers((prev) => [...prev, val])
                  }
                />
                <div className={styles.answers}>
                  {shortAnswers.map((answer: string) => {
                    return (
                      <div
                        className={clsx(
                          styles.shortAnswer,
                          globals[`${theme}BackgroundColor`],
                        )}
                      >
                        <p className={globals[`${theme}BackgroundColor`]}>
                          {answer}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
        <div className={styles.dialogOption}>
          <p className={clsx(globals.label, globals[`${theme}Color`])}>
            time limit
          </p>
          <div className={styles.hoursMinutesAndSeconds}>
            <Input
              variant={theme}
              placeholder="h"
              type="number"
              min="0"
              onChange={(e) => {
                setHours(e.currentTarget.valueAsNumber);
                handleChangeTimeLimit(
                  seconds,
                  minutes,
                  e.currentTarget.valueAsNumber,
                );
              }}
              fullClassName={styles.timeLimitInput}
            />
            <Input
              variant={theme}
              placeholder="m"
              type="number"
              onChange={(e) => {
                setMinutes(e.currentTarget.valueAsNumber);
                handleChangeTimeLimit(
                  seconds,
                  e.currentTarget.valueAsNumber,
                  hours,
                );
              }}
              min="0"
              max="59"
              fullClassName={styles.timeLimitInput}
            />
            <Input
              variant={theme}
              placeholder="s"
              type="number"
              onChange={(e) => {
                setSeconds(e.currentTarget.valueAsNumber);
                handleChangeTimeLimit(
                  e.currentTarget.valueAsNumber,
                  minutes,
                  hours,
                );
              }}
              min="0"
              max="59"
              fullClassName={styles.timeLimitInput}
            />
          </div>
        </div>
        <div className={styles.dialogOption}>
          <p className={clsx(globals.label, globals[`${theme}Color`])}>
            cover image
          </p>
          {file ? (
            <ImagePicker
              file={file}
              variant={theme}
              className={styles.imagePicker}
              required={true}
              onChange={setCoverImage}
            />
          ) : (
            <ImageDrop
              onFile={setFile}
              variant={theme}
              className={styles.imageDrop}
              required={true}
            />
          )}
        </div>
        <div className={styles.dialogOption}>
          <MultilineInput
            label="explanation"
            variant={theme}
            placeholder="enter the explanation"
            isReactFormHook={true}
            name="explanation"
            onChange={(e) => setExplanation(e.currentTarget.value)}
          />
        </div>
        <div className={styles.dialogOption}>
          <Input
            label="points"
            variant={theme}
            placeholder="enter the amount of points"
            isReactFormHook={true}
            name="points"
            type="number"
            defaultValue="1"
            min="0"
            onChange={(e) => setPoints(e.currentTarget.valueAsNumber)}
          />
        </div>
        <div className={styles.dialogOption}>
          <Button
            variant={"secondary"}
            label="add question"
            submit={false}
            onClick={onSubmit}
          >
            <AddIcon className={clsx(globals.lightFillChildren)} />
          </Button>
        </div>
      </div>
    </FormProvider>
  );
}
