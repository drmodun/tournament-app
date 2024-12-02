import { PartialType } from '@nestjs/swagger';
import { CreateGroupMembershipDto } from './create-group-membership.dto';

export class UpdateGroupMembershipDto extends PartialType(CreateGroupMembershipDto) {}
