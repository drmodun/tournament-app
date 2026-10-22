"use client";

import { openVansy, useMyVansyQuizzes } from "api/client/hooks/vansy";
import { clsx } from "clsx";
import Button from "components/button";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import styles from "views/vansyStageQuiz/vansyStageQuiz.module.scss";

/** Quizzes authored in Vansy, the exam platform where quizzes are now written and taken */
export default function VansyQuizzes() {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const { data, error } = useMyVansyQuizzes();

  return (
    <div
      className={clsx(
        styles.wrapper,
        globals[`${textColorTheme}MutedBackgroundColor`],
      )}
    >
      <h3 className={globals[`${textColorTheme}Color`]}>quizzes on Vansy</h3>
      <p className={globals.label}>
        write quizzes in Vansy, then link them to a quiz stage of your
        tournament
      </p>
      <div className={styles.actions}>
        <Button
          variant="primary"
          label="open the quiz editor"
          onClick={() => openVansy("/vansy/launch/author")}
        />
      </div>
      {error ? (
        <p className={globals.label}>Vansy is not available right now</p>
      ) : (
        <table className={styles.standings}>
          <tbody>
            {(data ?? []).map((quiz) => (
              <tr key={quiz.id}>
                <td>
                  <b>{quiz.title}</b>
                </td>
                <td>{quiz.questionCount} questions</td>
                <td>{quiz.publishState.toLowerCase()}</td>
                <td>
                  <Button
                    variant="warning"
                    label="manage"
                    onClick={() => openVansy(`/vansy/launch/manage/${quiz.id}`)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
