import { Injectable } from '@nestjs/common';
import { GroupRoleGuardMixin } from './group-role.mixin';

@Injectable()
export class GroupOwnerGuard extends GroupRoleGuardMixin('isOwner') {}
