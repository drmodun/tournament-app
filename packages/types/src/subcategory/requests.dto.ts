export interface ICreateSubcategoryRequest {
  name: string;
  description?: string;
  image?: string;
  categoryId: number;
}

export interface IUpdateSubcategoryRequest {
  name?: string;
  description?: string;
  image?: string;
  categoryId?: number;
}

export interface ISubcategoryQuery {
  name?: string;
  categoryId?: number;
}
