import { LFGSortingEnum } from "./responses.dto";

export interface ICreateLFGRequest {
  categoryIds: number[];
  message: string;
}

export interface IUpdateLFGRequest {
  categoryIds?: number[];
  message?: string;
}

export interface ILfgQuery {
  userId?: number;
}
