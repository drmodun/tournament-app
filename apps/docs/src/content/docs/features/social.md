---
title: Social, interests and categories
description: Following users, interests in categories, and the two block lists.
---

## Followers

Users follow other users. The relationship is stored in `follower` as `(user_id, follower_id)`.

| Endpoint                                         | Effect                                                                                               |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `POST /followers/:userId`                        | Follow `userId`. Following yourself is refused. The followed user gets a `new-follower` notification |
| `DELETE /followers/:userId`                      | Unfollow                                                                                             |
| `GET /followers`                                 | List relationships, filter by `userId` (their followers) or `followerId` (who they follow)           |
| `GET /followers/:userId/:followerId`             | Check one relationship                                                                               |
| `GET /followers/auto-complete/followers/:search` | Search your followers by name                                                                        |
| `GET /followers/auto-complete/following/:search` | Search the users you follow                                                                          |

## Interests

Interests record which categories a user plays, as `(user_id, category_id)`.

| Endpoint                       | Effect                                       |
| ------------------------------ | -------------------------------------------- |
| `POST /interest/:categoryId`   | Add an interest (`400` if it already exists) |
| `DELETE /interest/:categoryId` | Remove it (`400` if it does not exist)       |
| `GET /interest`                | Your interest categories, paginated          |

Groups have their own interests; see [Groups](/docs/features/groups/#interests). The web app manages both on
`/manageInterests` and `/manageGroupInterests/[id]`.

## Categories

Categories are the games or disciplines everything else hangs off. Each has a `name`, `description`, `image` and a
`type` (`programming`, `sports`, `other`).

| Endpoint                                                                          | Who        |
| --------------------------------------------------------------------------------- | ---------- |
| `GET /categories`, `GET /categories/:id`, `GET /categories/auto-complete/:search` | anyone     |
| `POST /categories`, `PATCH /categories/:id`, `DELETE /categories/:id`             | site admin |

## Block lists

There are two independent block lists.

### A user blocks a group

| Endpoint                                    | Effect                                   |
| ------------------------------------------- | ---------------------------------------- |
| `POST /blocked-groups/:groupId`             | Block a group (`400` if already blocked) |
| `DELETE /blocked-groups/:groupId`           | Unblock                                  |
| `GET /blocked-groups`                       | Your blocked groups                      |
| `GET /blocked-groups/auto-complete/:search` | Search them                              |

Blocked groups do not appear in your LFP results (`GET /lfp/groups`). Managed on `/manageBlockedGroups`.

### A group blocks a user

| Endpoint                                            | Who         | Effect                      |
| --------------------------------------------------- | ----------- | --------------------------- |
| `POST /blocked-users/:groupId/:userId`              | group admin | Block a user from the group |
| `DELETE /blocked-users/:groupId/:userId`            | group admin | Unblock                     |
| `GET /blocked-users/:groupId`                       | group admin | The group's block list      |
| `GET /blocked-users/auto-complete/:groupId/:search` | group admin | Search it                   |

Blocked users do not appear in the group's LFG results (`GET /lfg/:groupId`). Managed on `/manageBlockedUsers`.

Blocking only affects these discovery lists. It does not stop invitations, join requests or following.
