import { userRoleEnumType } from '@tournament-app/types';

export interface ValidatedUserDto {
  id: number;
  email: string;
  isFake: boolean;
  role: userRoleEnumType;
}
