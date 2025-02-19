import { groupFocusEnumType, groupTypeEnumType } from "src/enums";

export interface ICreateGroupRequest {
  name: string;
  abbreviation: string;
  description: string;
  type: groupTypeEnumType;
  focus: groupFocusEnumType;
  logo: string; // Dunno if this will work immediately
  location?: string;
  country?: string;
  userId?: number; // Only set by api
}

export interface IUpdateGroupRequest {
  name?: string;
  abbreviation?: string;
  description?: string;
  type?: groupTypeEnumType;
  focus?: groupFocusEnumType;
  logo?: string; // Dunno if this will work immediately
  location?: string;
  category?: string[];
}

export interface IGroupQuery {
  name?: string;
  abbreviation?: string;
  type?: groupTypeEnumType;
  focus?: groupFocusEnumType;
  location?: string;
  country?: string;
}
