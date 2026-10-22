---
title: Quizzes on Vansy
description: Quiz stages run on Vansy, the exam platform; how launches, results and standings work.
---

Quizzes are written, taken, proctored and reviewed in **Vansy**, a separate exam platform shared
with Biosfera. The tournament app keeps its users, tournaments, rosters and standings; it sends a
signed-in person to Vansy with a one-time launch and receives signed results back. The old `/quiz`
API ([Quizzes](/docs/features/quizzes/)) still works but is no longer what the web app uses.

## What the app asserts

| Launch | Who may | Sent to Vansy |
|---|---|---|
| Author | any signed-in user | `author` for owner `user:<id>` |
| Manage a quiz | its author or a site admin | `manage` for that quiz |
| Take | a member of a roster on the stage | the roster as the team (`externalTeamId` = roster id, `memberCount` = non-substitute members), the stage as `contextRef` |
| Proctor, review | the stage's organisers (`StageAdminGuard`) | `proctor` or `moderate` for the stage's quiz |

Every entrant is a team (a solo entrant is a roster of one), so only quizzes taking teams can be
linked to a stage. A roster has one attempt and one person taking it; Vansy refuses a second live
session for the same roster.

## Endpoints

| Route | Guard | Purpose |
|---|---|---|
| `POST /vansy/launch/author` | `JwtAuthGuard` | Open the Vansy editor |
| `POST /vansy/launch/manage/:quizId` | `JwtAuthGuard`, author or admin | Open one quiz |
| `GET /vansy/quizzes/mine` | `JwtAuthGuard` | The caller's Vansy quizzes |
| `GET /vansy/stages/:stageId/quiz` | – | The linked quiz |
| `GET /vansy/stages/:stageId/me` | `JwtAuthGuard` | `{ canTake, canManage }` for the caller, which the stage page uses |
| `PUT`, `DELETE /vansy/stages/:stageId/quiz` | `StageAdminGuard` | Link or unlink a quiz (also sets the quiz's context in Vansy) |
| `POST /vansy/stages/:stageId/launch/take` | `JwtAuthGuard`, roster member | Take the quiz |
| `POST /vansy/stages/:stageId/launch/proctor`, `/review` | `StageAdminGuard` | Proctor or review |
| `POST /vansy/stages/:stageId/finalize` | `StageAdminGuard` | Close the quiz now |
| `GET /vansy/stages/:stageId/results` | – | Stored standings and attempts |
| `POST /integrations/vansy/webhook` | Vansy's signature | Results from Vansy |

Each launch answers `{ launchUrl }`; the web app navigates there.

## Results and standings

The webhook receiver checks the `Vansy-Signature` JWT (issuer `vansy`, audience `tournaments`, at
most five minutes old, the SHA-256 of the raw body, and the event id), and ignores an `eventId` it
has already handled, since Vansy delivers at least once.

- `attempt.completed` and `attempt.reviewed` are stored in `vansy_attempt_result`.
- `quiz.results_final` (sent once the quiz closed and no integrity review is open) replaces the
  stage's rows in `vansy_stage_standing` with Vansy's team board.

`GET /matches/stage/:stageId/standings` of a `quiz` stage with those rows answers with
`format: "quiz"`: `place` is Vansy's rank (its tie-breakers, `LESS_TIME` by default, already
applied) and `points` is the quiz score plus carried points; rosters without an attempt share the
place after the last ranked one. Finishing the stage then runs the **existing conversion rules**
on those places, unchanged. A quiz stage without Vansy results keeps running as single elimination.

## Stage lifecycle

Link the quiz **before** starting the stage. A `quiz` stage with a linked Vansy quiz then starts
without drawing a bracket, and is finished automatically when `quiz.results_final` arrives, which
runs its conversion rules. A stage linked after it started keeps the bracket it drew; its standings
still come from the quiz once results arrive, but finishing it is up to the organiser.

## Configuration

| Variable | Meaning |
|---|---|
| `VANSY_URL` | Vansy's API as the server reaches it (e.g. `https://quiz.example.com/api`) |
| `VANSY_PRIVATE_KEY` | This app's Ed25519 private JWK; the public half is in Vansy's tenant file |
| `VANSY_TENANT_ID` | `tournaments` |
| `VANSY_PUBLIC_KEY` | Optional; Vansy's public JWK. Otherwise read from Vansy's JWKS |

Without `VANSY_URL` and `VANSY_PRIVATE_KEY` the integration is off and its endpoints answer `503`.
The tracked `.env` points at a Vansy dev stack on `localhost:5600` with Vansy's throwaway dev key.
