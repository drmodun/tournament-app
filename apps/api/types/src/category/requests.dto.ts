export interface ICreateCategoryRequest {
  name: string;
  description: string;
  logo: string;
  type: string;
}

export interface IUploadCategoryLogoRequest {
  logo: string;
}
export interface IUpdateCategoryRequest {
  name?: string;
  description?: string;
  type?: string;
}

export type BaseUpdateCategoryRequest =
  | ICreateCategoryRequest
  | IUpdateCategoryRequest;

export interface ICategoryQuery {
  name?: string;
  type?: string;
}
