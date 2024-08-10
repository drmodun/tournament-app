import { MiniUserResponse } from '@tournament-app/types';
import { user } from 'src/db/schema';

export type databaseUserType = typeof user;

export function userToMiniUserMappingObject(model: databaseUserType) {
  return {
    id: model.id,
    username: model.username,
  };
}
