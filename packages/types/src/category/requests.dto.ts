export interface ICreateCategoryRequest {
  name: string;
  description: string;
  logo: string;
  type: string;
}

export interface IUploadCategoryLogoRequest {
  logo: string;
} // TODO. after implementing the upload endpoint maybe remove this or merge it with the update request

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
