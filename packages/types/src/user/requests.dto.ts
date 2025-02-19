export interface ICreateUserRequest {
  name: string;
  username: string;
  bio?: string;
  email: string;
  password: string;
  profilePicture?: string;
  country: string;
  isFake?: boolean;
  location?: string;
}

export interface IUpdateUserInfo {
  profilePicture?: string;
  country?: string;
  username?: string;
  name?: string;
  bio?: string;
}

export type BaseUserUpdateRequest = IUpdateUserInfo | ICreateUserRequest;

export interface UserQueryType {
  name?: string;
  username?: string;
  email?: string;
  country?: string;
  location?: string;
} // TODO: potentially add checks for this as well
