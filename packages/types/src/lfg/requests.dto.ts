export interface ICreateLFGRequest {
  id: number;
  categoryIds: number[];
  message: string;
  createdAt: Date;
}

export interface IUpdateLFGRequest {
  id: number;
  categoryIds: number[];
  message: string;
  updatedAt: Date;
}
