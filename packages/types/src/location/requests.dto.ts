export interface ICreateLocationRequest {
  name: string;
  apiId: string;
  lat: number;
  lng: number;
}

export interface IUpdateLocationRequest {
  name?: string;
  apiId?: string;
  lat?: number;
  lng?: number;
}

export type BaseLocationRequest =
  | ICreateLocationRequest
  | IUpdateLocationRequest;

export interface ILocationQuery {
  name?: string;
  apiId?: string;
  lat?: number;
  lng?: number;
  distance?: number;
}
