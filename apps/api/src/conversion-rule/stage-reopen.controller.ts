import {
  Controller,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ValidatedUserDto } from 'src/auth/dto/validatedUser.dto';
import { CurrentUser } from 'src/base/decorators/currentUser.decorator';
import { ConversionRuleService } from './conversion-rule.service';

// Lives with the conversion rules, which reopening a stage undoes
@ApiTags('stages')
@Controller('stages')
export class StageReopenController {
  constructor(private readonly conversionRuleService: ConversionRuleService) {}

  @Post(':stageId/reopen')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description:
      'Puts a finished stage back in play so its results can be corrected. Undoes the conversion rules that ran when it finished, which run again when it finishes again. Refused while a stage or tournament those rules fed has started. For the organisers of the stage and of every destination, and site admins',
    schema: { example: { id: 1, stageStatus: 'ongoing' } },
  })
  async reopen(
    @Param('stageId', ParseIntPipe) stageId: number,
    @CurrentUser() user: ValidatedUserDto,
  ) {
    return await this.conversionRuleService.reopenStage(stageId, user);
  }
}
