export interface ICreateLFPRequest {
  message: string;
}

export interface IUpdateLFPRequest {
  message?: string;
}

export interface IGetLFPRequest {
  groupId?: number;
  lat?: number;
  lng?: number;
  distance?: number;
}
