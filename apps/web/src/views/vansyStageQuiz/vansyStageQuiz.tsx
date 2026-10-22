"use client";

import {
  openVansy,
  useFinalizeVansyQuiz,
  useLinkVansyQuiz,
  useMyVansyQuizzes,
  useVansyStageQuiz,
  useVansyStageResults,
  useVansyStageRights,
} from "api/client/hooks/vansy";
import { useAuth } from "api/client/hooks/auth/useAuth";
import { clsx } from "clsx";
import Button from "components/button";
import ProgressWheel from "components/progressWheel";
import { useState } from "react";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import styles from "./vansyStageQuiz.module.scss";

/**
 * A quiz stage runs on Vansy: organisers link one of their Vansy quizzes, proctor and review it
 * there, and close it; players take it as their roster. Final standings come back from Vansy.
 */
export default function VansyStageQuiz({ stageId }: { stageId: number }) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  // The API decides: a roster member can take the quiz, an organiser can manage it
  const { data: user } = useAuth();
  const { data: rights } = useVansyStageRights(stageId, !!user);
  const isOrganiser = !!rights?.canManage;
  const isParticipant = !!rights?.canTake;
  const { data, isLoading, error } = useVansyStageQuiz(stageId);
  const { data: results } = useVansyStageResults(stageId);
  const { data: mine } = useMyVansyQuizzes(isOrganiser);
  const link = useLinkVansyQuiz(stageId);
  const finalize = useFinalizeVansyQuiz(stageId);
  const [choice, setChoice] = useState<string>("");

  if (isLoading) return <ProgressWheel variant={textColorTheme} />;
  if (error) return null;

  const linkable = (mine ?? []).filter((q) => q.participationMode !== "SOLO");

  return (
    <div
      className={clsx(
        styles.wrapper,
        globals[`${textColorTheme}MutedBackgroundColor`],
      )}
    >
      <h4>quiz</h4>
      {data?.linked ? (
        <p className={globals.label}>
          <b>{data.quiz?.title ?? "Vansy quiz"}</b>
          {data.quiz && (
            <>
              {" "}
              · {data.quiz.questionCount} questions ·{" "}
              {data.quiz.publishState.toLowerCase()}
            </>
          )}
        </p>
      ) : (
        <p className={globals.label}>no quiz is linked to this stage yet</p>
      )}

      <div className={styles.actions}>
        {data?.linked && isParticipant && (
          <Button
            variant="primary"
            label="take quiz"
            onClick={() => openVansy(`/vansy/stages/${stageId}/launch/take`)}
          />
        )}
        {data?.linked && isOrganiser && (
          <>
            <Button
              variant="warning"
              label="proctor"
              onClick={() =>
                openVansy(`/vansy/stages/${stageId}/launch/proctor`)
              }
            />
            <Button
              variant="warning"
              label="review flagged attempts"
              onClick={() =>
                openVansy(`/vansy/stages/${stageId}/launch/review`)
              }
            />
            <Button
              variant="danger"
              label="close quiz"
              onClick={() => finalize.mutate()}
            />
          </>
        )}
      </div>

      {isOrganiser && (
        <div className={styles.actions}>
          <select
            className={styles.select}
            aria-label="Vansy quiz"
            value={choice}
            onChange={(e) => setChoice(e.target.value)}
          >
            <option value="">choose one of your team quizzes</option>
            {linkable.map((q) => (
              <option key={q.id} value={q.id}>
                {q.title} ({q.publishState.toLowerCase()})
              </option>
            ))}
          </select>
          <Button
            variant="primary"
            label={data?.linked ? "change quiz" : "link quiz"}
            disabled={!choice}
            onClick={() => link.mutate(choice)}
          />
          <Button
            variant="light"
            label="author quizzes"
            onClick={() => openVansy("/vansy/launch/author")}
          />
        </div>
      )}

      {results && results.standings.length > 0 && (
        <table className={styles.standings}>
          <thead>
            <tr>
              <th>place</th>
              <th>roster</th>
              <th>score</th>
            </tr>
          </thead>
          <tbody>
            {results.standings.map((s) => (
              <tr key={s.rosterId}>
                <td>{s.rank}</td>
                <td>#{s.rosterId}</td>
                <td>{s.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
