"use client";

import EditIcon from "@mui/icons-material/Edit";
import {
  IExtendedStageResponseWithTournament,
  IQuizResponse,
  IRosterResponse,
} from "@tournament-app/types";
import { useAuthoredQuizzes } from "api/client/hooks/quiz";
import { clsx } from "clsx";
import Button from "components/button";
import Chip from "components/chip";
import Dialog from "components/dialog";
import ProgressWheel from "components/progressWheel";
import { useState } from "react";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import EditRosterForm from "views/editRosterForm";
import styles from "./manageQuizzes.module.scss";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import Link from "next/link";

export default function ManageQuizzes() {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const { data, isLoading } = useAuthoredQuizzes();
  return (
    <div className={styles.wrapper}>
      {isLoading ? (
        <ProgressWheel variant={textColorTheme}></ProgressWheel>
      ) : (
        <div className={styles.quizzes}>
          <h2 className={clsx(globals[`${textColorTheme}Color`], styles.title)}>
            manage quizzes
          </h2>
          {data?.map((quiz: IQuizResponse) => {
            return (
              <Link
                key={quiz.name}
                className={clsx(
                  globals[`${textColorTheme}BackgroundColor`],
                  globals[`${theme}Color`],
                  styles.userCard,
                )}
                href={`/quiz/${quiz.id}`}
              >
                <div className={styles.quizTop}>
                  {quiz.coverImage && (
                    <img src={quiz.coverImage} className={styles.coverImage} />
                  )}
                  <p>{quiz.name}</p>
                </div>
                <div className={styles.quizBottom}>
                  {quiz.timeLimitTotal && (
                    <div className={clsx(styles.property)}>
                      <b>time limit</b>
                      <div className={styles.timeLimit}>
                        <p>{Math.floor(quiz.timeLimitTotal / 3600)} h</p>
                        <p>
                          {Math.floor(
                            (quiz.timeLimitTotal -
                              Math.floor(quiz.timeLimitTotal / 3600) * 3600) /
                              60,
                          )}{" "}
                          min
                        </p>
                        <p>
                          {quiz.timeLimitTotal -
                            Math.floor(quiz.timeLimitTotal / 3600) * 3600 -
                            Math.floor(
                              (quiz.timeLimitTotal -
                                Math.floor(quiz.timeLimitTotal / 3600) * 3600) /
                                60,
                            ) *
                              60}{" "}
                          s
                        </p>
                      </div>
                    </div>
                  )}
                  {quiz.description && (
                    <div className={styles.property}>
                      <b>description</b>
                      <Markdown
                        className={globals[`${theme}Color`]}
                        rehypePlugins={[rehypeRaw]}
                      >
                        {quiz.description}
                      </Markdown>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
