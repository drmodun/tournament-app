import { ICategoryMiniResponseWithLogo } from "src/category";
import { IMiniUserResponseWithProfilePicture } from "src/user";

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
