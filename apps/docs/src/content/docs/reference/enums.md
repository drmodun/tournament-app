---
title: Enums
description: Allowed values for every enum shared by the database, API and web app.
---

All enums live in `packages/types/src/enums.ts`. The database's Postgres enums are generated from them, so these are
the only accepted values everywhere.

## Users and groups

| Enum               | Values                                    |
| ------------------ | ----------------------------------------- |
| `userRoleEnum`     | `admin`, `user`                           |
| `groupRoleEnum`    | `owner`, `admin`, `member`                |
| `groupTypeEnum`    | `public`, `private`, `fake`               |
| `groupFocusEnum`   | `participation`, `organization`, `hybrid` |
| `subscriptionEnum` | `free`, `pro`, `premium` (no feature yet) |

## Tournaments and stages

| Enum                          | Values                                                                                                                                         |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `tournamentTypeEnum`          | `league`, `competition`, `seasonal`, `contest`, `event`                                                                                        |
| `tournamentTeamTypeEnum`      | `solo`, `team`, `mixed`                                                                                                                        |
| `tournamentLocationEnum`      | `online`, `offline` (constant `ONSITE`), `hybrid`                                                                                              |
| `stageTypeEnum`               | `group`, `knockout`, `swiss`, `round_robin`, `fixture`, `double_elimination`, `quiz`, `compass`, `triple_elimination`, `evaluated_competition` |
| `stageStatusEnum`             | `upcoming`, `ongoing`, `finished`, `cancelled`                                                                                                 |
| `participationStatusEnum`     | `pending`, `approved`, `rejected`, `withdrawn`, `disqualified`, `completed` (not stored yet)                                                   |
| `matchupTypeEnum`             | `one_vs_one`, `ffa`                                                                                                                            |
| `categoryTypeEnum`            | `programming`, `sports`, `other`                                                                                                               |
| `pointConversionTypeEnum`     | `stage_to_stage`, `stage_to_tournament`, `tournament_to_tournament`                                                                            |
| `pointConversionStrategyEnum` | `qualification`, `ranking`, `elimination`, `hybrid`, `seed`, `tie_breaker`, `qualification_with_lcq`                                           |
| `OrganizerRoleEnum`           | `owner`, `admin`, `moderator` (no feature yet)                                                                                                 |
| `tournamentPromotionTypeEnum` | `side_promotion`, `main_promotion`, `video_promotion`, `full_page_promotion` (no feature yet)                                                  |

## Quizzes

| Enum                      | Values                                                                                                                                                                     |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `quizQuestionTypeEnum`    | `multiple_choice`, `true_false`, `short_answer`, `order`, `hotspot`, `programming`                                                                                         |
| `questionAnswerStateEnum` | `none`, `answered`, `draft`                                                                                                                                                |
| `submissionStatusEnum`    | `pending`, `approved`, `rejected`, `wrong_answer`, `compile_error`, `runtime_error`, `time_limit_exceeded`, `memory_limit_exceeded` (programming contests, no feature yet) |

## Notifications

`notificationTypeEnum`: `welcome`, `reset-password`, `verify-email`, `notification-of-ban`, `bet-outcome`,
`tournament-reminder`, `tournament-start`, `tournament-end`, `group-invitation`, `group-join-request`,
`group-join-approval`, `group-join-rejection`, `group-removal`, `group-admin-promotion`, `group-admin-demotion`,
`test-template`, `new-follower`.

The ones actually sent today are listed in [Notifications](/docs/features/notifications/#what-triggers-one).

## Not used by any feature yet

`betStatusEnum` (`pending`, `won`, `lost`, `cancelled`, `refunded`), `betTypeEnum` (`winner`, `points`,
`placement`), `reportTypeEnum` (`user`, `tournament`, `event`), `reportStatusEnum` (`pending`, `resolved`,
`rejected`), `chatRoomTypeEnum` (`tournament`, `direct`, `group`), `messageVisibilityEnum` (`public`,
`admin_only`), `likeTypeEnum` (`tournament_post`, `result_post`).

## Response types

Each domain also has a `<Domain>ResponsesEnum` naming its projections, used as the `responseType` query parameter.
Common values are `mini`, `mini-with-logo`, `base` and `extended`; some domains add their own (for example
`withChallongeTournament` for stages). See [Shared types package](/docs/architecture/types/#response-type-enums).
