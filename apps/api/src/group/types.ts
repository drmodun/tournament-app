import {
  IMiniGroupResponse,
  IMiniGroupResponseWithLogo,
  IMiniGroupResponseWithCountry,
  IGroupResponse,
  IGroupResponseExtended,
  GroupResponsesEnum,
} from '@tournament-app/types';

export type GroupReturnTypesEnumType =
  (typeof GroupResponsesEnum)[keyof typeof GroupResponsesEnum];

export type AnyGroupReturnType =
  | IMiniGroupResponse
  | IMiniGroupResponseWithLogo
  | IMiniGroupResponseWithCountry
  | IGroupResponse
  | IGroupResponseExtended;
