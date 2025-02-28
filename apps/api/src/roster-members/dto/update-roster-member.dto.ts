import { PartialType } from '@nestjs/swagger';
import { CreateRosterMemberDto } from './create-roster-member.dto';

export class UpdateRosterMemberDto extends PartialType(CreateRosterMemberDto) {}
