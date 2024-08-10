import { subscriptionEnum, userRoleEnum } from "src/enums";

export interface MiniUserResponse {
  id: number;
  username: string;
}

export interface MiniUserResponseWithProfilePicture extends MiniUserResponse {
  profilePicture: string;
}

export interface MiniUserResponseWithCountry
  extends MiniUserResponseWithProfilePicture {
  country: string;
}

export interface UserResponse extends MiniUserResponseWithCountry {
  email: string;
  bio: string;
  level: number;
  name: string;
  updatedAt: Date;
  followers: number;
}

export interface ExtendedUserResponse extends UserResponse {
  location: string;
  following: number;
  createdAt: Date;
}

export interface AdminUserResponse extends ExtendedUserResponse {
  subscription: subscriptionEnum;
  password: string;
  role: userRoleEnum;
  code: string;
}

//TODO: potentially add more content
