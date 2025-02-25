import { ICareerCategoryResponse } from "src/career";
import { ICategoryMiniResponse } from "src/category";
import { IMiniUserResponse, IMiniUserResponseWithCountry } from "src/user";

export interface ILFGMiniResponse {
  id: number;
  userId: number;
  categoryId: number;
  message: string;
  createdAt: Date;
}

export interface IMiniLFGResponseWithUser extends ILFGMiniResponse {
  user: IMiniUserResponse;
}

export interface IMiniLFGResponseWithCategory extends ILFGMiniResponse {
  categories: ICategoryMiniResponse[];
}

export interface ILFGResponse extends ILFGMiniResponse {
  user: IMiniUserResponseWithCountry;
  careers: ICareerCategoryResponse[];
}

export enum LFGSortingEnum {
  CREATED_AT = "created_at",
  UPDATED_AT = "updated_at",
  USER_USERNAME = "user_username",
  CATEGORIES = "categories",
}
