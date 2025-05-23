import { groupFocusEnumType, groupTypeEnumType } from "../enums";

export interface ICreateGroupRequest {
  name: string;
  abbreviation: string;
  description: string;
  type: groupTypeEnumType;
  focus: groupFocusEnumType;
  logo: string; // Dunno if this will work immediately
  locationId?: number;
  country?: string;
  userId?: number; // Only set by api
}

export interface ICreateFakeGroupRequest {
  name: string;
  abbreviation: string;
  logo: string; // Dunno if this will work immediately
  country?: string;
  locationId?: number;
}

export interface IUpdateGroupRequest {
  name?: string;
  abbreviation?: string;
  description?: string;
  type?: groupTypeEnumType;
  focus?: groupFocusEnumType;
  logo?: string; // Dunno if this will work immediately
  locationId?: number;
  category?: string[];
}

export interface IGroupQuery {
  name?: string;
  abbreviation?: string;
  type?: groupTypeEnumType;
  focus?: groupFocusEnumType;
  country?: string;
  locationId?: number;
}
