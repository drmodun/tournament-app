export interface ICreateLFGRequest {
  categoryIds: number[];
  message: string;
}

export interface IUpdateLFGRequest {
  categoryIds?: number[];
  message?: string;
}
