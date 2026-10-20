---
title: Shared types package
description: What lives in @tournament-app/types and how the apps consume it.
---

`packages/types` is published inside the workspace as `@tournament-app/types`. Both `apps/api` and `apps/web` depend
on it, which keeps request bodies, response shapes and enum values identical on both sides.

## Contents

```text
packages/types/src/
├── index.ts                  # re-exports everything
├── enums.ts                  # every domain enum (see Reference → Enums)
├── constants.ts              # ELO constants and rank thresholds
├── baseQuery.dto.ts          # BaseQueryType, pagination, links, metadata
├── baseActionInterfaces.ts   # action responses ({ id })
└── <domain>/                 # one folder per domain
    ├── requests.dto.ts       # ICreateXRequest, IUpdateXRequest, IXQuery
    └── responses.dto.ts      # IMiniXResponse, IXResponse, IExtendedXResponse, XResponsesEnum
```

Domains: `auth`, `career`, `category`, `challonge`, `followers`, `group`, `groupInvites`, `groupJoinRequests`,
`groupMembership`, `groupRequirements`, `lfg`, `lfp`, `location`, `match`, `notification`, `participation`,
`quiz`, `quizAttempt`, `quizAttemptAnswer`, `quizOption`, `quizQuestion`, `roster`, `stage`, `tournament`, `user`.

## Response type enums

Each domain declares which projections the API can return, for example:

```ts
export enum UserResponsesEnum {
  MINI = "mini",
  MINI_WITH_PFP = "mini-with-pfp",
  MINI_WITH_COUNTRY = "mini-with-country",
  BASE = "base",
  EXTENDED = "extended",
  ADMIN = "admin",
}
```

The value is passed as the `responseType` query parameter, and the API repository selects a matching column set
and joins. The web app uses the matching interface (`IMiniUserResponse`, `IUserResponse`, ...) as the type of the
result.

## Enums shared with the database

`exportEnumValues(enum)` turns a TypeScript enum into the tuple Drizzle's `pgEnum` needs. The API schema builds every
Postgres enum this way, so adding a value to an enum in this package and generating a migration is all it takes to
extend it everywhere.

## Constants

`constants.ts` holds the ELO parameters (`BASE_ELO = 1000`, K-factors 50 / 32 / 20 with thresholds at 10 and 20
matches) and the rank thresholds used to label ratings:

| Rank         | Upper bound (ELO) |
| ------------ | ----------------- |
| Bronze       | 800               |
| Silver       | 950               |
| Gold         | 1100              |
| Platinum     | 1250              |
| Diamond      | 1400              |
| Master       | 1500              |
| Grand Master | 1600              |
| Champion     | 1700              |
| Elite        | above 1700        |

## Building

The package is compiled with `tsup` to ESM, CJS and declaration files in `dist/`. Turborepo builds it before any app
(`dependsOn: ["^build"]`); during `yarn dev` it rebuilds on change with `tsup --watch`.
