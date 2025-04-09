"use client";

import CheckIcon from "@mui/icons-material/Check";
import { UseMutationResult } from "@tanstack/react-query";
import {
  CreateQuizDto,
  ICreateQuizOptionDto,
  ICreateQuizQuestionDto,
} from "@tournament-app/types";
import { clsx } from "clsx";
import Button from "components/button";
import ImageDrop from "components/imageDrop";
import ImagePicker from "components/imagePicker";
import Input from "components/input";
import RichEditor from "components/richEditor";
import SlideButton from "components/slideButton";
import { useState } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { QUESTION_TYPE_MAP } from "utils/mixins/formatting";
import CreateQuizQuestionForm from "views/createQuizQuestionForm";
import styles from "./createQuizForm.module.scss";
import { useCreateQuiz } from "api/client/hooks/quiz";

export default function CreateQuizForm({
  mutation,
  onClose,
}: {
  mutation?: UseMutationResult<any, any, CreateQuizDto, void>;
  onClose?: () => void;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const createQuizMutation = useCreateQuiz();

  const [file, setFile] = useState<File>();

  const [coverImage, setCoverImage] = useState<string>();

  const [isImmediateFeedback, setIsImmediateFeedback] =
    useState<boolean>(false);
  const [isRandomizedQuestions, setIsRandomizedQuestions] =
    useState<boolean>(false);
  const [isAnonymousAllowed, setIsAnonymousAllowed] = useState<boolean>(false);
  const [isRetakeable, setIsRetakeable] = useState<boolean>(false);
  const [isTest, setIsTest] = useState<boolean>(false);
  const [hours, setHours] = useState<number>(NaN);
  const [minutes, setMinutes] = useState<number>(NaN);
  const [seconds, setSeconds] = useState<number>(NaN);

  const addMethods = useForm<CreateQuizDto>();
  const onAddSubmit: SubmitHandler<CreateQuizDto> = async (data) => {
    if (!isNaN(hours) || !isNaN(minutes) || !isNaN(seconds))
      data.timeLimitTotal =
        (isNaN(hours) ? 0 : hours * 3600) +
        (isNaN(minutes) ? 0 : minutes * 60) +
        (isNaN(seconds) ? 0 : seconds);

    data.questions = questions;
    data.isTest = isTest;
    data.isRetakeable = isRetakeable;
    data.isAnonymousAllowed = isAnonymousAllowed;
    data.isRandomizedQuestions = isRandomizedQuestions;
    data.isImmediateFeedback = isImmediateFeedback;

    if (coverImage) data.coverImage = coverImage;

    await createQuizMutation.mutateAsync(data);

    onClose && onClose();
  };

  const [questions, setQuestions] = useState<ICreateQuizQuestionDto[]>([]);

  return (
    <FormProvider {...addMethods}>
      <form
        onSubmit={addMethods.handleSubmit(onAddSubmit)}
        className={styles.form}
      >
        <div className={styles.dialogOption}>
          <Input
            variant={textColorTheme}
            label="name"
            placeholder="enter quiz name"
            isReactFormHook={true}
            required={true}
            name="name"
            reactFormHookProps={{
              pattern: {
                value: /^.{6,32}/i,
                message: "quiz name must be between 6 and 32 characters",
              },
            }}
          />
          {addMethods.formState.errors.name?.type === "required" && (
            <p className={styles.error}>this field is required!</p>
          )}
          {addMethods.formState.errors.name?.type === "pattern" && (
            <p className={styles.error}>
              {addMethods.formState.errors.name.message}
            </p>
          )}
        </div>

        <div className={styles.dialogOption}>
          <Input
            variant={textColorTheme}
            label="starting time"
            placeholder="enter the quiz's starting time"
            name="startDate"
            required={true}
            className={styles.input}
            isReactFormHook={true}
            type="datetime-local"
            min={new Date()
              .toISOString()
              .slice(0, new Date().toISOString().lastIndexOf(":"))}
          />
          {addMethods.formState.errors.startDate?.type === "required" && (
            <p className={styles.error}>this field is required!</p>
          )}
        </div>

        <div className={styles.dialogOption}>
          <Input
            variant={textColorTheme}
            label="ending time"
            placeholder="enter the quiz's ending time"
            name="endDate"
            className={styles.input}
            isReactFormHook={true}
            type="datetime-local"
            min={new Date()
              .toISOString()
              .slice(0, new Date().toISOString().lastIndexOf(":"))}
          />
        </div>

        <div className={styles.dialogOption}>
          <Input
            label="passing score"
            variant={textColorTheme}
            placeholder="enter the passing score"
            isReactFormHook={true}
            name="passingScore"
            type="number"
            min="0"
          />
        </div>

        <div className={styles.dialogOption}>
          <Input
            label="number of attempts"
            variant={textColorTheme}
            placeholder="enter the max number of attempts"
            isReactFormHook={true}
            name="maxAttempts"
            type="number"
            min="1"
            defaultValue="1"
          />
        </div>

        <div className={styles.dialogOption}>
          <p className={clsx(globals.label, globals[`${textColorTheme}Color`])}>
            cover image
          </p>
          {file ? (
            <ImagePicker
              file={file}
              name="coverImage"
              isReactFormHook={true}
              variant={textColorTheme}
              className={styles.imagePicker}
              required={true}
              onChange={setCoverImage}
            />
          ) : (
            <ImageDrop
              onFile={setFile}
              variant={textColorTheme}
              className={styles.imageDrop}
              required={true}
              name="coverImage"
              isReactFormHook={true}
            />
          )}

          {addMethods.formState.errors.coverImage?.type === "required" && (
            <p className={styles.error}>this field is required!</p>
          )}
        </div>

        <div className={styles.dialogOption}>
          <p className={clsx(globals.label, globals[`${textColorTheme}Color`])}>
            description
          </p>
          <RichEditor
            name="description"
            isReactHookForm={true}
            variant={textColorTheme}
            required={true}
            isSSR={true}
          />
          {addMethods.formState.errors.description?.type === "required" && (
            <p className={styles.error}>this field is required!</p>
          )}
        </div>
        <div className={styles.dialogOption}>
          <p className={clsx(globals.label, globals[`${textColorTheme}Color`])}>
            total time limit
          </p>
          <div className={styles.hoursMinutesAndSeconds}>
            <Input
              variant={textColorTheme}
              placeholder="hours"
              type="number"
              min="0"
              onChange={(e) => {
                setHours(e.currentTarget.valueAsNumber);
              }}
              fullClassName={styles.timeLimitInput}
            />
            <Input
              variant={textColorTheme}
              placeholder="minutes"
              type="number"
              onChange={(e) => {
                setMinutes(e.currentTarget.valueAsNumber);
              }}
              min="0"
              max="59"
              fullClassName={styles.timeLimitInput}
            />
            <Input
              variant={textColorTheme}
              placeholder="seconds"
              type="number"
              onChange={(e) => {
                setSeconds(e.currentTarget.valueAsNumber);
              }}
              min="0"
              max="59"
              fullClassName={styles.timeLimitInput}
            />
          </div>
        </div>
        <div className={styles.dialogOption}>
          <p className={clsx(globals.label, globals[`${textColorTheme}Color`])}>
            allow immediate feedback
          </p>
          <SlideButton
            options={["no", "yes"]}
            onChange={(val: string) => setIsImmediateFeedback(val === "yes")}
            isReactFormHook={true}
            name="isImmediateFeedback"
            variant={textColorTheme}
          />
        </div>
        <div className={styles.dialogOption}>
          <p className={clsx(globals.label, globals[`${textColorTheme}Color`])}>
            randomize question order
          </p>
          <SlideButton
            options={["no", "yes"]}
            onChange={(val: string) => setIsRandomizedQuestions(val === "yes")}
            isReactFormHook={true}
            name="isRandomizedQuestions"
            variant={textColorTheme}
          />
        </div>
        <div className={styles.dialogOption}>
          <p className={clsx(globals.label, globals[`${textColorTheme}Color`])}>
            allow anonymous users
          </p>
          <SlideButton
            options={["no", "yes"]}
            onChange={(val: string) => setIsAnonymousAllowed(val === "yes")}
            isReactFormHook={true}
            name="isAnonymousAllowed"
            variant={textColorTheme}
          />
        </div>
        <div className={styles.dialogOption}>
          <p className={clsx(globals.label, globals[`${textColorTheme}Color`])}>
            use test format
          </p>
          <SlideButton
            options={["no", "yes"]}
            onChange={(val: string) => setIsTest(val === "yes")}
            isReactFormHook={true}
            name="isTest"
            variant={textColorTheme}
          />
        </div>
        <div className={styles.dialogOption}>
          <p className={clsx(globals.label, globals[`${textColorTheme}Color`])}>
            make quiz retakeable
          </p>
          <SlideButton
            options={["no", "yes"]}
            onChange={(val: string) => setIsRetakeable(val === "yes")}
            isReactFormHook={true}
            name="isRetakeable"
            variant={textColorTheme}
          />
        </div>

        <div className={clsx(styles.dialogOption, styles.addQuestion)}>
          <p className={clsx(globals.label, globals[`${textColorTheme}Color`])}>
            add question
          </p>
          <div
            className={clsx(
              styles.quizQuestionForm,
              globals[`${textColorTheme}BackgroundColor`]
            )}
          >
            <CreateQuizQuestionForm
              setQuestions={setQuestions}
              variant={theme}
            />
          </div>
        </div>
        <div className={clsx(styles.dialogOption)}>
          <p className={clsx(globals.label, globals[`${textColorTheme}Color`])}>
            current questions
          </p>
          <div className={styles.questions}>
            {questions.length == 0 ? (
              <p>no questions yet!</p>
            ) : (
              questions.map((q) => {
                return (
                  <div
                    className={clsx(
                      globals[`${textColorTheme}BackgroundColor`],
                      globals[`${theme}Color`],
                      styles.question
                    )}
                  >
                    <div className={styles.questionTop}>
                      {q.image && (
                        <img
                          src={q.image}
                          className={styles.questionCoverImage}
                          onError={() => {
                            q.image = null;
                          }}
                        />
                      )}
                      <p>{q.question}</p>
                    </div>
                    <div className={styles.questionBottom}>
                      {q.timeLimit && q.timeLimit > 0 && (
                        <div className={styles.questionProperty}>
                          <b>time limit</b>
                          <div className={styles.timeLimit}></div>
                          {q.timeLimit >= 3600 && (
                            <p>{`${Math.floor(q.timeLimit / 3600)} h`}</p>
                          )}
                          {q.timeLimit >= 60 && (
                            <p>{`${Math.floor((q.timeLimit - Math.floor(q.timeLimit / 3600) * 3600) / 60)} min`}</p>
                          )}

                          <p>{`${q.timeLimit - Math.floor(q.timeLimit / 3600) * 3600 - Math.floor((q.timeLimit - Math.floor(q.timeLimit / 3600) * 3600) / 60) * 60} s`}</p>
                        </div>
                      )}
                      {q.points && (
                        <div className={styles.questionProperty}>
                          <b>points</b>
                          <p>{q.points}</p>
                        </div>
                      )}
                      {q.questionType && (
                        <div className={styles.questionProperty}>
                          <b>question type</b>
                          <p>{QUESTION_TYPE_MAP[q.questionType]}</p>
                        </div>
                      )}

                      <div
                        className={clsx(
                          styles.questionProperty,
                          styles.options
                        )}
                      >
                        <b>options</b>
                        {q.options?.map((options: ICreateQuizOptionDto) => {
                          return (
                            <div
                              className={clsx(
                                styles.questionOption,
                                globals[`${theme}BackgroundColor`],
                                globals[`${textColorTheme}Color`]
                              )}
                            >
                              <p>{options.option ?? options}</p>
                              {options.isCorrect && (
                                <CheckIcon
                                  className={globals.primaryFillChildren}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        <Button variant={"primary"} submit={true} label="create quiz" />
      </form>
    </FormProvider>
  );
}
