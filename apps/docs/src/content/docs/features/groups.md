---
title: Groups
description: Group types and roles, invitations, join requests, membership requirements, interests and block lists.
---

A group is a team or an organisation. Groups enter team tournaments, can be the affiliated organiser of a tournament,
post "looking for players" listings, and invite players.

## Group settings

| Field                   | Values                                              | Effect                                                                                                                    |
| ----------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `type`                  | `public` (default), `private`, `fake`               | Public groups accept join requests. Private groups are invitation only. Fake groups are placeholders for filling brackets |
| `focus`                 | `participation`, `organization`, `hybrid` (default) | Descriptive: whether the group plays, organises, or both                                                                  |
| `abbreviation`          | text                                                | Short tag shown next to the name                                                                                          |
| `country`, `locationId` |                                                     | Used for requirements and distance search                                                                                 |

## Roles

| Role     | Can                                                                                                                                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `owner`  | Everything an admin can, plus delete the group                                                                                                                                                                     |
| `admin`  | Edit the group, invite users, accept or reject join requests, change member roles, remove members, manage requirements, interests, LFP posts and the block list, enter the group in tournaments, build its rosters |
| `member` | View requirements and LFP posts, leave the group                                                                                                                                                                   |

Site admins pass every group role check.

:::note[Who becomes owner]
`POST /groups` adds the creator as `admin`, not `owner`, and `PATCH /group-membership/:groupId/:userId` refuses to
set the `owner` role. Only seeded groups have an owner. In practice that means deleting a group created through the
API needs a site admin. See [Known limitations](/docs/reference/known-limitations/).
:::

## Creating a group

`POST /groups` (any signed-in user) creates the group and the creator's membership in one transaction.
`POST /groups/fake` creates a fake group (type `fake`) for tournament managers who need placeholder teams.

## Invitations

An admin invites a user with `POST /group-invites/:groupId/:userId` and an optional message (and the related LFG post
id when the invitation answers one).

- Fake groups cannot invite (`400`).
- Inviting someone who is already a member returns `400`.
- There can be one invitation per (group, user) pair.
- The invited user gets a `group-invitation` notification.

The invited user then calls:

| Endpoint                                | Effect                                                                |
| --------------------------------------- | --------------------------------------------------------------------- |
| `POST /group-invites/:groupId/accept`   | Becomes a `member`, the invitation is deleted, a notification is sent |
| `DELETE /group-invites/:groupId/reject` | The invitation is deleted, a notification is sent                     |

Both require that the caller is not already a member (`GroupNonMemberGuard`).

## Join requests

A user asks to join with `POST /group-join-requests/:groupId` and an optional message (and the related LFP post id).

- Only **public** groups accept requests. Private groups return `400` ("cannot create a group join request for a
  private group"), fake groups `400` too.
- The caller must not already be a member.
- Every member with the `admin` role receives a `group-join-request` notification. The owner is not included, since
  the lookup filters on `admin` only.

The requester can edit (`PATCH`) or withdraw (`DELETE /group-join-requests/:groupId`) the request. An admin decides:

| Endpoint                                              | Effect                                                               |
| ----------------------------------------------------- | -------------------------------------------------------------------- |
| `POST /group-join-requests/:groupId/:userId/accept`   | Requester becomes a `member`, request deleted, approval notification |
| `DELETE /group-join-requests/:groupId/:userId/reject` | Request deleted, rejection notification                              |

## Membership

| Endpoint                                    | Who         | Effect                                                                              |
| ------------------------------------------- | ----------- | ----------------------------------------------------------------------------------- |
| `GET /group-membership`                     | anyone      | List memberships, filter by group or user                                           |
| `DELETE /group-membership/:groupId/leave`   | member      | Leave the group                                                                     |
| `PATCH /group-membership/:groupId/:userId`  | group admin | Change role between `member` and `admin`. Promotion and demotion send notifications |
| `DELETE /group-membership/:groupId/:userId` | group admin | Remove a member; they get a `group-removal` notification                            |
| `POST /group-membership/:groupId/:userId`   | site admin  | Add someone directly, skipping invitations                                          |

## Requirements

Admins can attach requirements to a group with `POST /group-requirements/:groupId` (update with `PUT`, remove with
`DELETE`); members can read them.

| Requirement                | Meaning                                          |
| -------------------------- | ------------------------------------------------ |
| `minimumAge`, `maximumAge` | Derived from the player's `dateOfBirth`          |
| `isSameCountry`            | Player's `country` must equal the group's        |
| ELO requirements           | Per category, a `minimumElo` and/or `maximumElo` |

Requirements are applied when a group browses LFG players (`GET /lfg/:groupId`): age and country filter the results.
A same-country requirement on a group without a country returns no players at all. ELO requirements are stored and
shown with LFP posts but are not used to filter. Requirements are not enforced when inviting or accepting members.

## Interests

`POST /group-interests/:groupId/:categoryId` and `DELETE` (admins) record which categories a group plays.
`GET /group-interests/:groupId` lists them.

## Block list

A group admin can block a user from the group with `POST /blocked-users/:groupId/:userId`. Blocked users are hidden
from that group's LFG search. The reverse, a user blocking a group, is described in
[Social: followers and blocking](/docs/features/social/).

## Read endpoints

`GET /groups` (with filters and pagination), `GET /groups/:groupId`, `GET /groups/:groupId/members`,
`GET /groups/:groupId/tournaments`, `GET /groups/:groupId/followers`, and `GET /groups/auto-complete/:search`.
`GET /groups/for-roster/:tournamentId` returns the groups the caller administers that are entered in the tournament,
used by the roster form.
