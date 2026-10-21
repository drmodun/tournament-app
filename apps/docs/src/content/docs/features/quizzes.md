---
title: Quizzes
description: Authoring quizzes, attempts, answer checking, scoring and the leaderboard.
---

Any signed-in user can author quizzes. A quiz can stand alone or be attached to a stage (for `quiz` stages) or to
a single matchup.

## Authoring

`POST /quiz` creates a quiz with its questions and options in one request; the caller becomes the author.
`PUT /quiz/:quizId` changes the fields you send; when you send `questions` they replace all of the quiz's questions
(leave them out to keep them), which is refused with `400` once anyone has attempted the quiz, because replacing them
would delete the answers given. `tags` (tag ids) replace the quiz's tags, and are stored when the quiz is created.
`DELETE /quiz/:quizId` removes it. Only the **author** may edit, delete or read
the detailed version with answers (`GET /quiz/detailed/:quizId`), along with site admins.
`GET /quiz/authored` lists your quizzes.

### Quiz settings

| Field                               | Default              | Meaning                                                                                     |
| ----------------------------------- | -------------------- | ------------------------------------------------------------------------------------------- |
| `name`, `description`, `coverImage` |                      | Display                                                                                     |
| `startDate`, `endDate`              | `startDate` required | Scheduling                                                                                  |
| `timeLimitTotal`                    | none                 | Total time in seconds                                                                       |
| `isTest`                            | `true`               | Test mode: all questions visible at once, free navigation. Otherwise one question at a time |
| `isImmediateFeedback`               | `false`              | Show correctness right after answering                                                      |
| `isRandomizedQuestions`             | `false`              | Shuffle question order                                                                      |
| `isRetakeable`                      | `false`              | Allow more than one attempt per user                                                        |
| `isAnonymousAllowed`                | `false`              | Allow attempts without a user                                                               |
| `passingScore`                      | none                 | Pass mark as a percentage                                                                   |
| `stageId`, `matchupId`              |                      | Attach the quiz to a stage or matchup                                                       |

The API enforces all of these: the schedule, the total time limit, test mode, question order and per-question time
limits (see [Attempts](#attempts)).

### Reading a quiz

`GET /quiz/:quizId` returns the quiz without its questions. With `responseType=FOR_ATTEMPT` it adds the questions and
options without the correct answers, but only for a test that has started (`403` before `startDate`, `400` for a quiz
shown one question at a time, whose questions come one by one from the attempt). `responseType=EXTENDED`, which
includes the answers and per-option counts, is refused (`400`); the author reads it at `GET /quiz/detailed/:quizId`.
`GET /quiz` lists quizzes and refuses both of those response types (`400`).

### Question types

| Type                                                            | How it is checked                                                                                           |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `multiple_choice`                                               | The selected option's `isCorrect`                                                                           |
| `true_false`, `short_answer`, `order`, `hotspot`, `programming` | The trimmed answer must equal one of the comma-separated values in `correctAnswers` (exact, case-sensitive) |

Each question has `points` (default 5), an optional per-question `timeLimit` in seconds, an optional `explanation`, an
optional image, and its own `isImmediateFeedback` flag. In requests the type is `questionType` and the image `image`;
options are optional, so short-answer questions need none.

`passingRate` in the detailed quiz is the share of submitted attempts that scored at least `passingScore` percent of
the quiz's total points.

## Attempts

```text
POST /quiz-attempt/:quizId                     start (or resume) an attempt
POST /quiz-attempt/answers/:attemptId/:qId     answer a question
PUT  /quiz-attempt/answers/:attemptId/:answerId change an answer
GET  /quiz-attempt/:attemptId/current-question the question to answer now (one at a time)
PUT  /quiz-attempt/:attemptId/submit           submit and score
GET  /quiz-attempt/leaderboard/:quizId         ranking
```

### Starting

- Starting an attempt locks the quiz briefly, so it cannot be edited at the same moment: an edit that replaces the
  questions either comes first (and the attempt then sees the new questions) or is refused. If the quiz was edited
  while the attempt was starting, the answer is `409` and the client tries again.
- Before `startDate` the quiz refuses attempts (`403`, "This quiz has not started yet"), and after `endDate` too
  ("This quiz has ended").
- If the quiz is not retakeable and the user has already **submitted** an attempt, `403` ("You have already attempted
  this quiz"). Site admins skip this check.
- If the user has an attempt that is **not yet submitted**, that attempt is returned instead of creating a new one,
  so reloading the page resumes it.
- A new attempt stores its `questionOrder`: the question ids by id, or shuffled when `isRandomizedQuestions` is set.

### Answering

- Only the attempt's owner may answer (site admins excepted, and they skip the checks below).
- The question must belong to the attempt's quiz (`404` otherwise) and a `selectedOptionId` must be one of that
  question's options (`400`).
- Each question can be answered once per attempt with `POST`; a second `POST` returns `400` ("Answer already exists").
  Use `PUT` to change it.
- The answer is checked immediately and `isCorrect` is stored.
- If the question has `isImmediateFeedback`, the answer is **final**: it cannot be changed afterwards.
- Answers are refused once the quiz's `endDate` has passed, and for timed quizzes once `timeLimitTotal` seconds (plus
  10 seconds of grace for latency) have passed since the attempt started (`403`, "The time for this attempt is up").
  Submitting still works, so the answers given in time are scored.

### One question at a time

A quiz with `isTest: false` is shown one question at a time, in the attempt's `questionOrder`, and the API keeps track
of where the attempt is:

- `GET /quiz-attempt/:attemptId/current-question` returns `index`, `total`, when the question was shown
  (`startedAt`), when its time runs out (`deadline`, or null without a `timeLimit`) and the `question` with its
  options but without answers. Once every question is done, `question` is null and `index` equals `total`. For a test
  it returns `400`.
- Only the current question can be answered (`403` for a later one, and for an earlier one: "This question is closed").
- Every answer is final (`PUT` returns `403`), and answering shows the next question.
- A question whose `timeLimit` (plus 10 seconds of grace) runs out unanswered is skipped: the next question counts
  as shown at the moment the time ran out, and an answer sent later is refused.

In a test (`isTest: true`, the default) every question is open at once and per-question time limits do not apply;
only the total time limit does.

### Submitting

`PUT /quiz-attempt/:attemptId/submit` sets `isSubmitted` and `endTime`, then computes the score as the sum of
`points` over the correctly answered questions.

### Leaderboard

`GET /quiz-attempt/leaderboard/:quizId` ranks submitted attempts by score (highest first), breaking ties by the
earlier `endTime`. It is paginated.

### Other reads

`GET /quiz-attempt/my-attempts` lists your attempts, `GET /quiz-attempt/:attemptId` returns one (owner or site
admin), and `GET /quiz-attempt` lists attempts with filters.

## In the web app

`/manageQuizzes` and `/manageUserManagedQuizzes` are the authoring screens (create and edit forms for quizzes and
questions), and `/quiz/[id]` shows a quiz to its author with its answers and statistics. The web app has no screen
for taking a quiz yet; attempts go through the API above.
