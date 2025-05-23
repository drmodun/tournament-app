import { ICategoryMiniResponseWithLogo } from "../category";
import { IMiniUserResponseWithCountry, IMiniUserResponseWithProfilePicture } from "../user";

export interface IMiniCareerResponse {
  userId: number;
  categoryId: number;
  elo: number;
  createdAt: Date;
}

export interface ICareerUserResponse extends IMiniCareerResponse {
  user: IMiniUserResponseWithProfilePicture;
}

export interface ICareerCategoryResponse extends IMiniCareerResponse {
  category: ICategoryMiniResponseWithLogo;
}
