---
title: Introduction
description: What the tournament app does and the vocabulary used across these docs.
---

The tournament app (branded **winning.sh** in the UI and the Swagger title) is a platform where people form
groups, run tournaments made of one or more stages, play matches in brackets the API runs itself, take
quizzes, and find teams or players.

## What you can do with it

- **Accounts**: register with email and password (email confirmation required) or sign in with Google.
- **Groups**: public or private teams with owner, admin and member roles, invitations, join requests, membership
  requirements and block lists.
- **Tournaments**: solo, team or mixed competitions with participant limits, rating (MMR) bounds, an optional
  affiliated group, and an ordered list of stages.
- **Rosters**: the concrete line-up a participant fields in a stage, with substitute and change limits.
- **Matches**: score entry by tournament managers, with brackets run by the API (single, double or triple
  elimination, compass, round robin or Swiss, with standings), or mirrored to Challonge when `CHALLONGE_ENABLED=true`. Point
  conversion rules carry placings into later stages and tournaments. Ranked results update ELO ratings.
- **Quizzes**: timed or untimed quizzes with several question types, retake rules, automatic scoring and a
  leaderboard.
- **LFG / LFP**: "looking for group" posts by players and "looking for players" posts by groups, matched with group
  requirements, block lists and distance.
- **Notifications**: stored notifications delivered live over server-sent events, plus transactional email.

## Vocabulary

| Term                       | Meaning                                                                                                                                                                          |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **User**                   | An account. `role` is `user` or `admin`; an `admin` is a site-wide superuser who passes most guards.                                                                             |
| **Fake user / fake group** | Placeholder entities (`isFake`, `type = fake`) a manager creates to fill a bracket. Only allowed in tournaments that permit fake players and are not ranked.                     |
| **Group**                  | A team or organisation. Members have the group role `owner`, `admin` or `member`.                                                                                                |
| **Category**               | The game or discipline (for example a sport or a programming contest). Tournaments, interests, careers and LFG posts point at categories.                                        |
| **Tournament**             | A competition in one category. Holds settings and an ordered list of stages.                                                                                                     |
| **Stage**                  | One phase of a tournament (group stage, knockout, ...). Each stage has its own dates, status and roster rules, and, when Challonge is enabled, maps to one Challonge tournament. |
| **Participation**          | The fact that a user (solo) or a group (team) is entered in a tournament.                                                                                                        |
| **Roster**                 | A participation's line-up for one stage: a list of users, some marked as substitutes.                                                                                            |
| **Matchup**                | One match in a stage between rosters, with per-round scores.                                                                                                                     |
| **Career**                 | A user's ELO rating in one category (default 1000).                                                                                                                              |
| **LFG / LFP**              | Looking for group (a player's post) / looking for players (a group's post).                                                                                                      |

## Status of the project

The README is explicit that this is work in progress. The web app has no screen for taking a quiz yet, and its forms
take image URLs rather than uploads, although the API supports both. The `apps/admin` panel is a placeholder: site admins currently use the normal web app with every permission. See
[Known limitations](/docs/reference/known-limitations/) for behaviour that differs from what you might expect.
