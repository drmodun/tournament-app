---
title: LFG and LFP
description: Looking-for-group posts by players, looking-for-players posts by groups, and how each side is matched.
---

Two mirrored features help players and groups find each other:

- **LFG (looking for group)**: a player posts a message and the categories they play. Group admins browse matching
  players and invite them.
- **LFP (looking for players)**: a group posts a message. Players browse matching groups and send join requests.

## LFG: players looking for a group

| Endpoint            | Who                | Effect                                            |
| ------------------- | ------------------ | ------------------------------------------------- |
| `POST /lfg`         | signed-in user     | Create a post: `message` plus `categoryIds`       |
| `GET /lfg/me`       | signed-in user     | Your posts, with your ELO in each listed category |
| `PATCH /lfg/:id`    | the post's author  | Change message and categories                     |
| `DELETE /lfg/:id`   | the post's author  | Delete                                            |
| `GET /lfg/:groupId` | admin of the group | Players whose posts match the group               |

A user can have several LFG posts. Update and delete only touch posts whose `userId` is the caller.

### How players are matched to a group

`GET /lfg/:groupId` returns LFG posts with the author, the categories and the author's ELO per category, excluding:

1. users the group has **blocked**,
2. users who are already **members** of the group,
3. if the group has requirements:
   - `isSameCountry`: users whose `country` differs from the group's. If the group has no country set, the result is
     empty;
   - `minimumAge` / `maximumAge`: users outside the age range, computed from `dateOfBirth`.

ELO requirements are not applied here. An invitation sent from this list can carry the LFG post id
(`relatedLFGId`).

The web app's `/manageLFG` is where players manage their post, and the group page shows matching players to admins.

## LFP: groups looking for players

| Endpoint                   | Who            | Effect                                      |
| -------------------------- | -------------- | ------------------------------------------- |
| `POST /lfp/:groupId`       | group admin    | Create a post for the group                 |
| `GET /lfp/:groupId`        | group member   | The group's posts                           |
| `PATCH /lfp/:groupId/:id`  | group admin    | Edit a post                                 |
| `DELETE /lfp/:groupId/:id` | group admin    | Delete a post                               |
| `GET /lfp/groups`          | signed-in user | LFP posts from groups that match the caller |

### How groups are matched to a player

`GET /lfp/groups?lat=…&lng=…&distance=…` returns LFP posts with the group, its location, requirements, ELO
requirements and their categories, excluding:

1. groups the user has **blocked**,
2. groups the user is already a **member** of,
3. when `lat`, `lng` and `distance` (kilometres) are given: groups whose location is farther away than `distance`
   (PostGIS `ST_DWithin` on the group's location).

Requirements are returned so the client can show them, not used to filter on this side. A join request sent from a
post can carry its id (`relatedLFPId`). `/lfp/[...slug]` in the web app is the browsing screen.

:::caution
Two rough edges in the current implementation: the distance filter combines its three inputs with a bitwise `&`
instead of `&&`, so it can be skipped for some coordinate values. And editing or deleting an LFP post checks that you
administer the group in the URL, not that the post belongs to that group. Both are listed in
[Known limitations](/docs/reference/known-limitations/).
:::
