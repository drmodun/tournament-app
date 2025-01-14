import { Injectable } from '@nestjs/common';
import { GroupRoleGuardMixin } from './group-role.mixin';

@Injectable()
export class GroupAdminGuard extends GroupRoleGuardMixin('isAdmin') {}
