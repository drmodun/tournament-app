import { categoryTypeEnum } from "../enums";

export interface ICategoryMiniResponse {
  id: number;
  name: string;
}

export interface ICategoryMiniResponseWithLogo extends ICategoryMiniResponse {
  logo: string;
}

export interface ICategoryResponse extends ICategoryMiniResponseWithLogo {
  description: string;
  type: categoryTypeEnum;
  tournamentCount: number;
  activeTournamentCount: number;
}

export interface IExtendedCategoryResponse extends ICategoryResponse {
  createdAt: Date;
  updatedAt: Date;
}

export type BaseCategoryResponseType =
  | ICategoryMiniResponse
  | ICategoryResponse
  | ICategoryResponse;

export enum CategoryResponsesEnum {
  MINI = "mini",
  MINI_WITH_LOGO = "mini-with-logo",
  BASE = "base",
  EXTENDED = "extended",
}

export enum CategorySortingEnum {
  NAME = "name",
  CREATED_AT = "createdAt",
  UPDATED_AT = "updatedAt",
  TOURNAMENT_COUNT = "tournament-count",
}

export type CategoryReturnTypesEnumType =
  (typeof CategoryResponsesEnum)[keyof typeof CategoryResponsesEnum];

export type CategorySortingEnumType =
  (typeof CategorySortingEnum)[keyof typeof CategorySortingEnum];
