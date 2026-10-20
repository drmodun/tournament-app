import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ValidatedUserDto } from 'src/auth/dto/validatedUser.dto';
import { CurrentUser } from 'src/base/decorators/currentUser.decorator';
import { ActionResponsePrimary } from 'src/base/actions/actionResponses.dto';
import { ConversionRuleService } from './conversion-rule.service';
import {
  ConversionRuleQuery,
  CreateConversionRuleDto,
} from './dto/requests.dto';
import { ConversionRuleResponse } from './dto/responses.dto';

@ApiTags('conversion-rules')
@Controller('conversion-rules')
export class ConversionRuleController {
  constructor(private readonly conversionRuleService: ConversionRuleService) {}

  @Get()
  @ApiOkResponse({ type: [ConversionRuleResponse] })
  async findAll(@Query() query: ConversionRuleQuery) {
    return await this.conversionRuleService.findAll(query);
  }

  @Get(':ruleId')
  @ApiOkResponse({ type: ConversionRuleResponse })
  async findOne(@Param('ruleId', ParseIntPipe) id: number) {
    return await this.conversionRuleService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description:
      'Creates a rule; the caller must organise both the source and the destination',
    type: ActionResponsePrimary,
  })
  async create(
    @Body() dto: CreateConversionRuleDto,
    @CurrentUser() user: ValidatedUserDto,
  ) {
    return await this.conversionRuleService.create(dto, user);
  }

  @Post(':ruleId/apply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description:
      'Applies a rule whose source has finished. Stages run by the API apply their rules by themselves when they finish',
    type: ConversionRuleResponse,
  })
  async apply(
    @Param('ruleId', ParseIntPipe) id: number,
    @CurrentUser() user: ValidatedUserDto,
  ) {
    return await this.conversionRuleService.applyNow(id, user);
  }

  @Delete(':ruleId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ActionResponsePrimary })
  async remove(
    @Param('ruleId', ParseIntPipe) id: number,
    @CurrentUser() user: ValidatedUserDto,
  ) {
    return await this.conversionRuleService.remove(id, user);
  }
}
