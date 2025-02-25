export interface IMiniLocationResponse {
  id: number;
  apiId: string;
}

export interface ILocationResponse extends IMiniLocationResponse {
  name: string;
  coordinates: [number, number];
}

export interface IExtendedLocationResponse extends ILocationResponse {
  createdAt: Date;
}

export type BaseLocationResponse =
  | IMiniLocationResponse
  | ILocationResponse
  | IExtendedLocationResponse;

export enum LocationResponsesEnum {
  MINI = "mini",
  BASE = "base",
  EXTENDED = "extended",
}

export type LocationResponseEnumType =
  (typeof LocationResponsesEnum)[keyof typeof LocationResponsesEnum];

export enum LocationSortingEnum {
  NAME = "name",
  CREATED_AT = "createdAt",
  UPDATED_AT = "updatedAt",
  LAT = "lat",
  LNG = "lng",
}
