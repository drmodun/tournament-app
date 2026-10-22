import type { ICategoryMiniResponseWithLogo } from "src/category";

export interface ISubcategoryMiniResponse {
  id: number;
  name: string;
}

export interface ISubcategoryResponse extends ISubcategoryMiniResponse {
  description: string | null;
  image: string | null;
  categoryId: number;
  tournamentCount: number;
}

export interface IExtendedSubcategoryResponse extends ISubcategoryResponse {
  category: ICategoryMiniResponseWithLogo;
  createdAt: Date;
}

export type BaseSubcategoryResponseType =
  | ISubcategoryMiniResponse
  | ISubcategoryResponse
  | IExtendedSubcategoryResponse;

export enum SubcategoryResponsesEnum {
  MINI = "mini",
  BASE = "base",
  EXTENDED = "extended",
}

export enum SubcategorySortingEnum {
  NAME = "name",
  CREATED_AT = "createdAt",
  TOURNAMENT_COUNT = "tournament-count",
}

export type SubcategoryResponsesEnumType =
  (typeof SubcategoryResponsesEnum)[keyof typeof SubcategoryResponsesEnum];
