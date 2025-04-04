"use client";

import { UseMutationResult } from "@tanstack/react-query";
<<<<<<< HEAD
import { CreateQuizDto, ICreateQuizQuestionDto } from "@tournament-app/types";
=======
import { CreateQuizDto } from "@tournament-app/types";
>>>>>>> 89c8adb (WIP: quiz support)
import { clsx } from "clsx";
import Button from "components/button";
import Dropdown from "components/dropdown";
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
import styles from "./createQuizForm.module.scss";
import MultilineInput from "components/multilineInput";
import CreateQuizQuestionForm from "views/createQuizQuestionForm";
import AddIcon from "@mui/icons-material/Add";

export default function CreateQuizForm({
  mutation,
  onClose,
}: {
  mutation?: UseMutationResult<any, any, CreateQuizDto, void>;
  onClose?: () => void;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const [file, setFile] = useState<File>();

  const [coverImage, setCoverImage] = useState<string>();

  const [isImmediateFeedback, setIsImmediateFeedback] =
    useState<boolean>(false);
  const [isRandomizedQuestions, setIsRandomizedQuestions] =
    useState<boolean>(false);
  const [isAnonymousAllowed, setIsAnonymousAllowed] = useState<boolean>(false);
  const [isRetakeable, setIsRetakeable] = useState<boolean>(false);
  const [isTest, setIsTest] = useState<boolean>(false);

  const addMethods = useForm<CreateQuizDto>();
  const onAddSubmit: SubmitHandler<CreateQuizDto> = async (data) => {
    onClose && onClose();
  };

<<<<<<< HEAD
  const [questions, setQuestions] = useState<ICreateQuizQuestionDto[]>([]);
=======
  const [questionCount, setQuestionCount] = useState<number>(0);
>>>>>>> 89c8adb (WIP: quiz support)

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
            label="passing score"
            variant={textColorTheme}
            placeholder="enter the passing score"
            isReactFormHook={true}
            name="passingScore"
            type="number"
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
          />
          {addMethods.formState.errors.description?.type === "required" && (
            <p className={styles.error}>this field is required!</p>
          )}
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
<<<<<<< HEAD
          <CreateQuizQuestionForm setQuestions={setQuestions} />
        </div>
        <div className={clsx(styles.dialogOption, styles.addQuestion)}>
          <p className={clsx(globals.label, globals[`${textColorTheme}Color`])}>
            current question
          </p>
        </div>
=======
          <Button
            variant="primary"
            className={clsx(styles.iconButton, styles.button)}
            onClick={() => setQuestionCount((prev) => prev + 1)}
          >
            <AddIcon
              className={clsx(globals.lightFillChildren, styles.iconButton)}
            />
          </Button>
        </div>
        {Array.from(Array(questionCount).keys()).map(() => (
          <CreateQuizQuestionForm setQuestionCount={setQuestionCount} />
        ))}

>>>>>>> 89c8adb (WIP: quiz support)
        <Button variant={"primary"} submit={true} label="create quiz" />
      </form>
    </FormProvider>
  );
}
