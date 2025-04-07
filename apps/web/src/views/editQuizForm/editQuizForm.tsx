"use client";

import CheckIcon from "@mui/icons-material/Check";
import { UseMutationResult } from "@tanstack/react-query";
import {
  CreateQuizDto,
  ICreateQuizOptionDto,
  ICreateQuizQuestionDto,
  IQuizResponseExtended,
} from "@tournament-app/types";
import { clsx } from "clsx";
import Button from "components/button";
import ImageDrop from "components/imageDrop";
import ImagePicker from "components/imagePicker";
import Input from "components/input";
import RichEditor from "components/richEditor";
import SlideButton from "components/slideButton";
import { useEffect, useState } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { QUESTION_TYPE_MAP } from "utils/mixins/formatting";
import CreateQuizQuestionForm from "views/createQuizQuestionForm";
import styles from "./createQuizForm.module.scss";
import { UpdateQuizParams, useUpdateQuiz } from "api/client/hooks/quiz";
import { formatDateHTMLInput } from "utils/mixins/formatting";
import { imageUrlToFile } from "utils/mixins/helpers";

export default function EditQuizForm({
  mutation,
  quiz,
  onClose,
}: {
  mutation?: UseMutationResult<any, any, UpdateQuizParams, void>;
  quiz?: IQuizResponseExtended;
  onClose?: () => void;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const createQuizMutation = mutation ?? useUpdateQuiz();

  const [file, setFile] = useState<File>();

  const [coverImage, setCoverImage] = useState<string>();

  const [isAnonymousAllowed, setIsAnonymousAllowed] = useState<boolean>(false);
  const [isRetakeable, setIsRetakeable] = useState<boolean>(false);
  const [hours, setHours] = useState<number>(NaN);
  const [minutes, setMinutes] = useState<number>(NaN);
  const [seconds, setSeconds] = useState<number>(NaN);

  const editMethods = useForm<CreateQuizDto>();
  const onEditSubmit: SubmitHandler<CreateQuizDto> = async (data) => {
    if (!isNaN(hours) || !isNaN(minutes) || !isNaN(seconds))
      data.timeLimitTotal =
        (isNaN(hours) ? 0 : hours * 3600) +
        (isNaN(minutes) ? 0 : minutes * 60) +
        (isNaN(seconds) ? 0 : seconds);

    data.questions = questions;
    data.isRetakeable = isRetakeable;
    data.isAnonymousAllowed = isAnonymousAllowed;

    if (coverImage) data.coverImage = coverImage;

    await createQuizMutation.mutateAsync({ ...data, id: quiz?.id });

    onClose && onClose();
  };

  const [questions, setQuestions] = useState<ICreateQuizQuestionDto[]>([]);

  useEffect(() => {
    imageUrlToFile(quiz?.coverImage).then((val) => setFile(val));
  }, []);

  return (
    <FormProvider {...editMethods}>
      <form
        onSubmit={editMethods.handleSubmit(onEditSubmit)}
        className={styles.form}
      >
        <div className={styles.dialogOption}>
          <Input
            defaultValue={quiz?.name}
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
          {editMethods.formState.errors.name?.type === "required" && (
            <p className={styles.error}>this field is required!</p>
          )}
          {editMethods.formState.errors.name?.type === "pattern" && (
            <p className={styles.error}>
              {editMethods.formState.errors.name.message}
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
            defaultValue={
              quiz?.startDate
                ? new Date(quiz.startDate)
                    .toISOString()
                    .slice(0, new Date().toISOString().lastIndexOf(":"))
                : new Date()
                    .toISOString()
                    .slice(0, new Date().toISOString().lastIndexOf(":"))
            }
          />
          {editMethods.formState.errors.startDate?.type === "required" && (
            <p className={styles.error}>this field is required!</p>
          )}
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
            defaultValue={quiz?.passingScore?.toString()}
          />
        </div>
        {/*
        <div className={styles.dialogOption}>
          <Input
            label="number of attempts"
            variant={textColorTheme}
            placeholder="enter the max number of attempts"
            isReactFormHook={true}
            name="maxAttempts"
            type="number"
            min="1"
            defaultValue={quiz?.}
          />
        </div>
        */}

        <div className={styles.dialogOption}>
          <p className={clsx(globals.label, globals[`${textColorTheme}Color`])}>
            cover image
          </p>
          {file ? (
            <>
              <ImagePicker
                file={file}
                name="coverImage"
                isReactFormHook={true}
                variant={textColorTheme}
                className={styles.imagePicker}
                required={true}
                onChange={setCoverImage}
              />
              <Button
                variant="danger"
                label="remove"
                className={styles.removeLogoButton}
                onClick={() => {
                  setFile(undefined);
                  editMethods.setValue("coverImage", undefined);
                }}
              />
            </>
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

          {editMethods.formState.errors.coverImage?.type === "required" && (
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
            startingContent={quiz?.description ?? ""}
          />
          {editMethods.formState.errors.description?.type === "required" && (
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
              defaultValue={((quiz?.timeLimitTotal ?? 0) >= 3600
                ? Math.floor((quiz?.timeLimitTotal ?? 0) / 3600)
                : 0
              ).toString()}
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
              defaultValue={((quiz?.timeLimitTotal ?? 0) >= 60
                ? Math.floor(
                    ((quiz?.timeLimitTotal ?? 0) -
                      Math.floor((quiz?.timeLimitTotal ?? 0) / 3600) * 3600) /
                      60,
                  )
                : 0
              ).toString()}
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
              defaultValue={(
                (quiz?.timeLimitTotal ?? 0) -
                Math.floor((quiz?.timeLimitTotal ?? 0) / 3600) * 3600 -
                Math.floor((quiz?.timeLimitTotal ?? 0) / 60) * 60
              ).toString()}
            />
          </div>
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
            defaultValue={quiz?.isAnonymousAllowed ? "yes" : "no"}
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
            defaultValue={quiz?.isRetakable ? "yes" : "no"}
          />
        </div>

        <div className={clsx(styles.dialogOption, styles.addQuestion)}>
          <p className={clsx(globals.label, globals[`${textColorTheme}Color`])}>
            add question
          </p>
          <div
            className={clsx(
              styles.quizQuestionForm,
              globals[`${textColorTheme}BackgroundColor`],
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
              [...questions, ...(quiz?.questions ?? [])].map((q) => {
                return (
                  <div
                    className={clsx(
                      globals[`${textColorTheme}BackgroundColor`],
                      globals[`${theme}Color`],
                      styles.question,
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
                      <p>{q?.question ?? ""}</p>
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
                          styles.options,
                        )}
                      >
                        <b>options</b>
                        {q.options?.map((options: ICreateQuizOptionDto) => {
                          return (
                            <div
                              className={clsx(
                                styles.questionOption,
                                globals[`${theme}BackgroundColor`],
                                globals[`${textColorTheme}Color`],
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
        <Button variant={"warning"} submit={true} label="edit quiz" />
      </form>
    </FormProvider>
  );
}
