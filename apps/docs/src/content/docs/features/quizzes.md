---
title: Quizzes
description: Authoring quizzes, attempts, answer checking, scoring and the leaderboard.
---

Any signed-in user can author quizzes. A quiz can stand alone or be attached to a stage (for `quiz` stages) or to
a single matchup.

## Authoring

`POST /quiz` creates a quiz with its questions and options in one request; the caller becomes the author.
`PUT /quiz/:quizId` replaces it and `DELETE /quiz/:quizId` removes it. Only the **author** may edit, delete or read
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

The API enforces the schedule and the total time limit (see [Attempts](#attempts)). Per-question time limits,
randomisation and test mode are handled by the web client.

### Question types

| Type                                                            | How it is checked                                                                                           |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `multiple_choice`                                               | The selected option's `isCorrect`                                                                           |
| `true_false`, `short_answer`, `order`, `hotspot`, `programming` | The trimmed answer must equal one of the comma-separated values in `correctAnswers` (exact, case-sensitive) |

Each question has `points` (default 5), an optional per-question `timeLimit`, an optional `explanation`, an optional
image, and its own `isImmediateFeedback` flag.

## Attempts

```text
POST /quiz-attempt/:quizId                     start (or resume) an attempt
POST /quiz-attempt/answers/:attemptId/:qId     answer a question
PUT  /quiz-attempt/answers/:attemptId/:answerId change an answer
PUT  /quiz-attempt/:attemptId/submit           submit and score
GET  /quiz-attempt/leaderboard/:quizId         ranking
```

### Starting

- Before `startDate` the quiz refuses attempts (`403`, "This quiz has not started yet"), and after `endDate` too
  ("This quiz has ended").
- If the quiz is not retakeable and the user has already **submitted** an attempt, `403` ("You have already attempted
  this quiz"). Site admins skip this check.
- If the user has an attempt that is **not yet submitted**, that attempt is returned instead of creating a new one,
  so reloading the page resumes it.

### Answering

- Only the attempt's owner may answer (site admins excepted).
- Each question can be answered once per attempt with `POST`; a second `POST` returns `400` ("Answer already exists").
  Use `PUT` to change it.
- The answer is checked immediately and `isCorrect` is stored.
- If the question has `isImmediateFeedback`, the answer is **final**: it cannot be changed afterwards, and the
  attempt's `currentQuestion` moves forward.
- Answers are refused once the quiz's `endDate` has passed, and for timed quizzes once `timeLimitTotal` seconds (plus
  10 seconds of grace for latency) have passed since the attempt started (`403`, "The time for this attempt is up").
  Submitting still works, so the answers given in time are scored.

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
questions). `/quiz/[id]` is where users take a quiz.
