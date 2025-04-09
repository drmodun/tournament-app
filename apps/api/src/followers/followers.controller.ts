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
  ApiOperation,
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
  @ApiBearerAuth()
  @ApiOkResponse({
    description:
      'Returns a list of followers that can be auto-completed based on the search term.',
    type: [MiniUserResponseWithProfilePicture],
  })
  @ApiOperation({
    summary: 'Auto-complete followers based on search term',
    description:
      'Returns a list of followers that can be auto-completed based on the search term.',
  })
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
  @ApiBearerAuth()
  @ApiOkResponse({
    description:
      'Returns a list of users being followed that can be auto-completed based on the search term.',
    type: [MiniUserResponseWithProfilePicture],
  })
  @ApiOperation({
    summary: 'Auto-complete following based on search term',
    description:
      'Returns a list of users being followed that can be auto-completed based on the search term.',
  })
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
    description:
      'Retrieves a list of followers based on the provided query parameters.',
    content: {
      'application/json': {
        examples: followerQueryResponses,
      },
    },
  })
  @ApiOperation({
    summary: 'Retrieve all followers',
    description:
      'Retrieves a list of followers based on the provided query parameters.',
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
  @ApiOkResponse({
    description: 'Returns details of a specific follower relationship.',
    type: FollowerMiniResponse,
  })
  @ApiOperation({
    summary: 'Retrieve a specific follower relationship',
    description: 'Returns details of a specific follower relationship.',
  })
  async findOne(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('followerId', ParseIntPipe) followerId: number,
  ) {
    return await this.followersService.findOne(userId, followerId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':userId')
  @ApiOkResponse({
    description:
      'Creates a follower relationship for the current user with the specified user.',
    type: FollowerResponse,
  })
  @ApiOperation({
    summary: 'Create a follower relationship',
    description:
      'Creates a follower relationship for the current user with the specified user.',
  })
  async create(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: ValidatedUserDto,
  ) {
    return await this.followersService.create(userId, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':userId')
  @ApiOkResponse({
    description:
      'Removes the follower relationship for the current user with the specified user.',
    type: FollowerResponse,
  })
  @ApiOperation({
    summary: 'Remove a follower relationship',
    description:
      'Removes the follower relationship for the current user with the specified user.',
  })
  async remove(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: ValidatedUserDto,
  ) {
    return await this.followersService.remove(userId, user.id);
  }
}
