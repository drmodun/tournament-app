import {
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GroupMemberGuard } from './group-member.guard';

@Injectable()
export class GroupNonMemberGuard extends GroupMemberGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const result = await super.canActivate(context);
      return !result; // This also makes the superadmin unable to join groups by default - intended behavior
    } catch (error) {
      if (error instanceof NotFoundException) {
        return true;
      }

      throw error;
    }
  }
}
