export interface IEmailPasswordLoginRequest {
  email: string;
  password: string;
}

export interface IChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ISendResetPasswordEmailRequest {
  email: string;
}

export interface IResetPasswordRequest {
  newPassword: string;
}

export interface IUpdateEmailRequest {
  currentPassword: string;
  email: string;
}
