export interface ICreateUserRequest {
  name: string;
  username: string;
  bio?: string;
  email: string;
  password: string;
  profilePicture?: string;
  country: string;
  dateOfBirth: Date;
  isFake?: boolean;
}

export interface IUpdateUserInfo {
  profilePicture?: string;
  country?: string;
  username?: string;
  name?: string;
  bio?: string;
  dateOfBirth?: Date;
}

export type BaseUserUpdateRequest = IUpdateUserInfo | ICreateUserRequest;

export interface UserQueryType {
  name?: string;
  username?: string;
  email?: string;
  country?: string;
  age?: number;
} // TODO: potentially add checks for this as well

export interface ICreateFakeUserRequest {
  username: string;
  name: string;
  country?: string;
}
