"use client";

import { UseMutationResult } from "@tanstack/react-query";
import {
  CreateQuizDto,
<<<<<<< HEAD
<<<<<<< HEAD
  ICreateQuizQuestionDto,
=======
>>>>>>> 89c8adb (WIP: quiz support)
=======
>>>>>>> 89c8adb (WIP: quiz support)
  quizQuestionTypeEnum,
  quizQuestionTypeEnumType,
} from "@tournament-app/types";
import { clsx } from "clsx";
import Button from "components/button";
import Dropdown from "components/dropdown";
import ImageDrop from "components/imageDrop";
import ImagePicker from "components/imagePicker";
import Input from "components/input";
import RichEditor from "components/richEditor";
import SlideButton from "components/slideButton";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import styles from "./createQuizQuestionForm.module.scss";
import MultilineInput from "components/multilineInput";
import AddIcon from "@mui/icons-material/Add";
<<<<<<< HEAD
import CheckIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";

export default function AddQuestionForm({
  setQuestions,
  onClose,
}: {
  setQuestions?: Dispatch<SetStateAction<ICreateQuizQuestionDto[]>>;
  onClose?: () => void;
=======
import DeleteIcon from "@mui/icons-material/Delete";

export default function AddQuestionForm({
  type,
  setQuestionCount,
}: {
  type?: quizQuestionTypeEnumType;
  setQuestionCount: Dispatch<SetStateAction<number>>;
>>>>>>> 89c8adb (WIP: quiz support)
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const [file, setFile] = useState<File>();
  const [coverImage, setCoverImage] = useState<string>();
  const [questionType, setQuestionType] = useState<quizQuestionTypeEnumType>();
<<<<<<< HEAD
  const [shortAnswers, setShortAnswers] = useState<string[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [correct, setCorrect] = useState<number>(-1);
  const [timeLimit, setTimeLimit] = useState<number>();

  const methods = useForm<ICreateQuizQuestionDto>();
  const onSubmit = async (data: ICreateQuizQuestionDto) => {
    if (timeLimit) data.timeLimit = timeLimit;
    if (questionType) data.questionType = questionType;
    if (options)
      data.options = options.map((option, index) => {
        return { isCorrect: correct === index, option, questionId: -1 };
      });
    if (coverImage) data.image = coverImage;

    data.quizId = -1;

    setQuestions && setQuestions((prev) => [...prev, data]);
    onClose && onClose();
  };

=======

  const [shortAnswers, setShortAnswers] = useState<string[]>([]);

  const [options, setOptions] = useState<string[]>([]);
  const [correct, setCorrect] = useState<number>(-1);

  const [timeLimit, setTimeLimit] = useState<number>();

>>>>>>> 89c8adb (WIP: quiz support)
  const handleChangeTimeLimit = (value: number) => {
    setTimeLimit((prev) => {
      if (prev === undefined) return value;

      return prev + value;
    });
  };

<<<<<<< HEAD
  return (
    <FormProvider {...methods}>
      <form
        className={clsx(
          styles.wrapper,
          globals[`${textColorTheme}BackgroundColor`],
        )}
        onSubmit={methods.handleSubmit(onSubmit)}
      >
        <div className={styles.dialogOption}>
          <MultilineInput
            label="question"
            placeholder="enter question..."
            variant={theme}
            isReactFormHook={true}
            name="question"
            required={true}
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
=======
  useEffect(() => {
    type && setQuestionType(type);
  }, []);

  return (
    <div
      className={clsx(
        styles.wrapper,
        globals[`${textColorTheme}BackgroundColor`],
      )}
    >
      <div className={styles.dialogOption}>
        <MultilineInput
          label="question"
          placeholder="enter question..."
          variant={theme}
        />
      </div>
      <div className={styles.dialogOption}>
        <p className={clsx(globals.label, globals[`${theme}Color`])}>
          question type
        </p>
        {!type && (
          <Dropdown
            variant={theme}
            placeholder="select question type"
>>>>>>> 89c8adb (WIP: quiz support)
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
<<<<<<< HEAD
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
                  onChange={(val: string) => setCorrect(val === "true" ? 1 : 0)}
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
                    return (
                      <div
                        className={clsx(
                          styles.option,
                          index === correct
                            ? globals.primaryBackgroundColor
                            : globals[`${theme}BackgroundColor`],
                        )}
                      >
                        <p className={globals[`${textColorTheme}Color`]}>
                          {answer}
                        </p>
                        <div className={styles.optionActionButtons}>
                          {index !== correct && (
                            <Button
                              variant="primary"
                              onClick={() => setCorrect(index)}
                              className={styles.actionButton}
                            >
                              <CheckIcon
                                className={clsx(globals.lightFillChildren)}
                              />
                            </Button>
                          )}
                          <Button
                            variant="danger"
                            onClick={() => {
                              if (correct !== -1) {
                                if (index == correct) setCorrect(-1);
                                else if (index < correct)
                                  setCorrect((prev) => prev - 1);
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
              placeholder="hours"
              type="number"
              min="0"
              onChange={(e) =>
                handleChangeTimeLimit(parseInt(e.currentTarget.value) * 3600)
              }
            />
            <Input
              variant={theme}
              placeholder="minutes"
              type="number"
              onChange={(e) =>
                handleChangeTimeLimit(parseInt(e.currentTarget.value) * 60)
              }
              min="0"
            />
            <Input
              variant={theme}
              placeholder="seconds"
              type="number"
              onChange={(e) =>
                handleChangeTimeLimit(parseInt(e.currentTarget.value))
              }
              min="0"
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
              name="image"
              isReactFormHook={true}
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
              name="image"
              isReactFormHook={true}
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
          />
        </div>
        <div className={styles.dialogOption}>
          <Button
            variant={"secondary"}
            label="add question"
            className={styles.actionButton}
            submit={true}
          />
        </div>
      </form>
    </FormProvider>
=======
        )}
      </div>
      <div className={styles.dialogOption}>
        {questionType === quizQuestionTypeEnum.TRUE_FALSE ? (
          <SlideButton options={["false", "true"]} />
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
                !options.includes(val) && setOptions((prev) => [...prev, val])
              }
            />
            <div className={styles.answers}>
              {options.map((answer: string, index: number) => {
                return (
                  <div
                    className={clsx(
                      styles.option,
                      globals[`${theme}BackgroundColor`],
                    )}
                  >
                    <p className={globals[`${theme}BackgroundColor`]}>
                      {answer}
                    </p>
                    <div className={styles.optionActionButtons}>
                      <Button
                        variant="primary"
                        onClick={() => setCorrect(index)}
                      >
                        <DeleteIcon
                          className={globals.lightFillChildren}
                        ></DeleteIcon>
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => {
                          if (index == correct) setCorrect(-1);
                          setOptions((prev) =>
                            prev.filter((elem) => elem != answer),
                          );
                        }}
                      >
                        <DeleteIcon className={globals.lightFillChildren} />
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
      <div className={styles.dialogOption}>
        <Input
          label="question"
          variant={theme}
          placeholder="enter the question"
          isReactFormHook={true}
          name="question"
        />
      </div>
      <div className={styles.dialogOption}>
        <p className={clsx(globals.label, globals[`${theme}Color`])}>
          time limit
        </p>
        <div className={styles.hoursMinutesAndSeconds}>
          <Input
            variant={theme}
            placeholder="hours"
            type="number"
            min="0"
            onChange={(e) =>
              handleChangeTimeLimit(parseInt(e.currentTarget.value) * 3600)
            }
          />
          <Input
            variant={theme}
            placeholder="minutes"
            type="number"
            onChange={(e) =>
              handleChangeTimeLimit(parseInt(e.currentTarget.value) * 60)
            }
            min="0"
          />
          <Input
            variant={theme}
            placeholder="seconds"
            type="number"
            onChange={(e) =>
              handleChangeTimeLimit(parseInt(e.currentTarget.value))
            }
            min="0"
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
            name="image"
            isReactFormHook={true}
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
            name="image"
            isReactFormHook={true}
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
        />
      </div>
    </div>
>>>>>>> 89c8adb (WIP: quiz support)
  );
}
