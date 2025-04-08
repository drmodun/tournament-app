"use client";

import { IQuizResponseExtended } from "@tournament-app/types";
import { clsx } from "clsx";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import {
  calculateBestFutureDateFormat,
  formatDateTime,
  QUESTION_TYPE_MAP,
} from "utils/mixins/formatting";
import styles from "./manageQuiz.module.scss";
import CheckIcon from "@mui/icons-material/Check";
import { useDetailedQuiz } from "api/client/hooks/quiz";
import ProgressWheel from "components/progressWheel";
import { useEffect } from "react";

export default function ManageQuiz({ id }: { id: number }) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const { data: quiz, isLoading, isError } = useDetailedQuiz(id);

  useEffect(() => {
    console.log(isError, "error", quiz);
  }, [isError]);

  return (
    <div className={styles.wrapper}>
      {isLoading && (
        <div className={styles.progressWheel}>
          <ProgressWheel variant={textColorTheme}></ProgressWheel>
        </div>
      )}
      {!quiz && !isLoading && <p>there is no quiz!</p>}
      {quiz && (
        <div className={styles.quizzes}>
          <h2 className={clsx(globals[`${textColorTheme}Color`], styles.title)}>
            manage quiz
          </h2>
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
                        60
                    )}{" "}
                    min
                  </p>
                  <p>
                    {quiz.timeLimitTotal -
                      Math.floor(quiz.timeLimitTotal / 3600) * 3600 -
                      Math.floor(
                        (quiz.timeLimitTotal -
                          Math.floor(quiz.timeLimitTotal / 3600) * 3600) /
                          60
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
                  className={globals[`${textColorTheme}Color`]}
                  rehypePlugins={[rehypeRaw]}
                >
                  {quiz.description}
                </Markdown>
              </div>
            )}
            {quiz.startDate && (
              <div className={styles.property}>
                <b>start date</b>
                <p>
                  {formatDateTime(new Date(quiz.startDate))} (
                  {calculateBestFutureDateFormat(new Date(quiz.startDate))})
                </p>
              </div>
            )}
            {quiz.passingRate && (
              <div className={styles.property}>
                <b>passing rate</b>
                <p>
                  {quiz.passingRate}% (bound is {quiz.passingScore ?? 0})
                </p>
              </div>
            )}
            {!quiz.passingRate && quiz.passingScore && (
              <div className={styles.property}>
                <b>passing score</b>
                <p>{quiz.passingScore}</p>
              </div>
            )}
            {quiz.averageScore && quiz.medianScore && (
              <div className={styles.property}>
                <b>average score</b>
                <p>
                  avg - {quiz.averageScore}, median - {quiz.medianScore}
                </p>
              </div>
            )}
            {quiz.isRetakeable && (
              <div className={styles.property}>
                <b>is retakeable?</b>
                <p>{quiz.isRetakeable ? "yes" : "no"}</p>
              </div>
            )}
            {quiz.isAnonymousAllowed && (
              <div className={styles.property}>
                <b>are anonymous players allowed?</b>
                <p>{quiz.isAnonymousAllowed ? "yes" : "no"}</p>
              </div>
            )}
            {quiz.questions &&
              (quiz.questions.length === 0 ? (
                <p>there are no questions!</p>
              ) : (
                <div className={clsx(styles.questionsWrapper)}>
                  {quiz.questions.map((q) => {
                    return (
                      <div
                        className={clsx(
                          styles.questionWrapper,
                          globals[`${textColorTheme}BackgroundColor`],
                          globals[`${theme}Color`]
                        )}
                      >
                        <div className={styles.questionTop}>
                          {q.image && (
                            <img src={q.image} className={styles.coverImage} />
                          )}
                          <p>{q.name}</p>
                        </div>
                        <div className={styles.questionMiddle}>
                          {q.timeLimit && q.timeLimit > 0 && (
                            <div className={styles.questionProperty}>
                              <b>time limit</b>
                              <div className={styles.timeLimit}>
                                {q.timeLimit >= 3600 && (
                                  <p>{`${Math.floor(q.timeLimit / 3600)} h`}</p>
                                )}
                                {q.timeLimit >= 60 && (
                                  <p>{`${Math.floor((q.timeLimit - Math.floor(q.timeLimit / 3600) * 3600) / 60)} min`}</p>
                                )}

                                <p>{`${q.timeLimit - Math.floor(q.timeLimit / 3600) * 3600 - Math.floor((q.timeLimit - Math.floor(q.timeLimit / 3600) * 3600) / 60) * 60} s`}</p>
                              </div>
                            </div>
                          )}
                          {q.points && (
                            <div className={styles.questionProperty}>
                              <b>points</b>
                              <p>{q.points}</p>
                            </div>
                          )}
                          {q.type && (
                            <div className={styles.questionProperty}>
                              <b>type</b>
                              <p>{QUESTION_TYPE_MAP[q.type]}</p>
                            </div>
                          )}
                        </div>
                        <div className={styles.questionBottom}>
                          <b>options</b>
                          {q.options && (
                            <div className={styles.options}>
                              {q.options.map((o) => {
                                return (
                                  <div className={styles.optionWrapper}>
                                    <p>
                                      {o.option}{" "}
                                      {o.answerCount && `(${o.answerCount})`}
                                    </p>
                                    {o.isCorrect && (
                                      <CheckIcon
                                        className={
                                          globals[
                                            `${textColorTheme}BackgroundColor`
                                          ]
                                        }
                                      />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
