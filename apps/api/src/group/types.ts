import {
  IMiniGroupResponse,
  IMiniGroupResponseWithLogo,
  IMiniGroupResponseWithCountry,
  IGroupResponse,
  IGroupResponseExtended,
  GroupResponsesEnum,
} from '^tournament-app/types';

export interface IGroupWithTypeOnly {
  id: number;
  type: string;
}

export enum GroupDtosEnum {
  TYPE = 'type',
}

export type GroupDtosEnumType =
  (typeof GroupDtosEnum)[keyof typeof GroupDtosEnum];

export type GroupReturnTypesEnumType =
  | (typeof GroupResponsesEnum)[keyof typeof GroupResponsesEnum]
  | GroupDtosEnumType;

export type AnyGroupReturnType =
  | IMiniGroupResponse
  | IMiniGroupResponseWithLogo
  | IMiniGroupResponseWithCountry
  | IGroupResponse
  | IGroupResponseExtended
  | IGroupWithTypeOnly;
