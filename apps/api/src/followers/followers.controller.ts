import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { FollowersService } from './followers.service';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ParseIntPipe } from '@nestjs/common';
import { FollowerQuery } from './dto/request.dto';
import { FollowerMiniResponse, FollowerResponse } from './dto/responses.dto';
import { followerQueryResponses } from './dto/examples';
import { Request } from 'express';
import { IQueryMetadata } from '@tournament-app/types';
import { CurrentUser } from 'src/base/decorators/currentUser.decorator';
import { ValidatedUserDto } from 'src/auth/dto/validatedUser.dto';
import { MetadataMaker } from 'src/base/static/makeMetadata';
import { PaginationOnly } from 'src/base/query/baseQuery';
import { MiniUserResponseWithProfilePicture } from 'src/users/dto/responses.dto';

@ApiTags('followers')
@ApiExtraModels(FollowerResponse)
@Controller('followers')
export class FollowersController {
  constructor(private readonly followersService: FollowersService) {}

  @Get('auto-complete/followers/:search')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: [MiniUserResponseWithProfilePicture] })
  async autoCompleteFollowers(
    @Param('search') search: string,
    @Query() query: PaginationOnly,
    @CurrentUser() user: ValidatedUserDto,
  ) {
    return await this.followersService.autoCompleteFollowers(
      search,
      user.id,
      query,
    );
  }

  @Get('auto-complete/following/:search')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: [MiniUserResponseWithProfilePicture] })
  async autoCompleteFollowing(
    @Param('search') search: string,
    @Query() query: PaginationOnly,
    @CurrentUser() user: ValidatedUserDto,
  ) {
    return await this.followersService.autoCompleteFollowing(
      search,
      user.id,
      query,
    );
  }

  @Get()
  @ApiOkResponse({
    content: {
      'application/json': {
        examples: followerQueryResponses,
      },
    },
  })
  async findAll(@Query() query: FollowerQuery, @Req() req: Request) {
    const results = await this.followersService.findAll(query);

    const metadata: IQueryMetadata = MetadataMaker.makeMetadataFromQuery(
      query,
      results,
      req.url,
    );

    return {
      results,
      metadata,
    };
  }

  @Get(':userId/:followerId')
  @ApiOkResponse({ type: FollowerMiniResponse })
  async findOne(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('followerId', ParseIntPipe) followerId: number,
  ) {
    return await this.followersService.findOne(userId, followerId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':userId')
  async create(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: ValidatedUserDto,
  ) {
    return await this.followersService.create(userId, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':userId')
  async remove(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: ValidatedUserDto,
  ) {
    return await this.followersService.remove(userId, user.id);
  }
}
