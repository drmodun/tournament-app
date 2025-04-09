import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InterestService } from './interest.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/base/decorators/currentUser.decorator';
import { PaginationOnly } from 'src/base/query/baseQuery';
import { MetadataMaker } from 'src/base/static/makeMetadata';
import { ValidatedUserDto } from 'src/auth/dto/validatedUser.dto';

@ApiTags('interest')
@Controller('interest')
export class InterestController {
  constructor(private readonly interestService: InterestService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create interest',
  })
  @Post(':categoryId')
  async createInterest(
    @Param('categoryId') categoryId: number,
    @CurrentUser() user: ValidatedUserDto,
  ) {
    return await this.interestService.createInterest(categoryId, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete interest',
  })
  @Delete(':categoryId')
  async deleteInterest(
    @Param('categoryId') categoryId: number,
    @CurrentUser() user: ValidatedUserDto,
  ) {
    return await this.interestService.deleteInterest(categoryId, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get interest categories',
  })
  @Get()
  async getInterestCategories(
    @Query() query: PaginationOnly,
    @CurrentUser() user: ValidatedUserDto,
    @Req() req: Request,
  ) {
    const results = await this.interestService.getInterestCategories(
      user.id,
      query.page,
      query.pageSize,
    );

    const metadata = MetadataMaker.makeMetadataFromQuery(
      query,
      results,
      req.url,
    );

    return {
      results,
      metadata,
    };
  }
}
