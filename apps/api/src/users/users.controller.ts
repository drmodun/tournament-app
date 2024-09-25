import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  BaseUserResponseType,
  IQueryMetadata,
  UserResponseEnumType,
} from '@tournament-app/types';
import { MetadataMaker } from '../base/static/makeMetadata';
import {
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateUserRequest,
  UpdateUserInfo,
  UserQuery,
} from './dto/requests.dto';
import { ActionResponsePrimary } from 'src/base/actions/actionResponses.dto';
import {
  AdminUserResponse,
  ExtendedUserResponse,
  MiniUserResponse,
  MiniUserResponseWithCountry,
  MiniUserResponseWithProfilePicture,
  UserResponse,
} from './dto/responses.dto';
import {
  actualClassList,
  userQueryResponses,
  userResponseExamples,
  userResponseSchema,
} from './dto/examples';
import { BaseQueryResponse } from 'src/base/query/baseResponse';

@ApiTags('users')
@Controller('users')
/**
 * Controller class for managing user-related operations.
 */
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiExtraModels(
    MiniUserResponse,
    MiniUserResponseWithProfilePicture,
    MiniUserResponseWithCountry,
    UserResponse,
    ExtendedUserResponse,
    AdminUserResponse,
    BaseQueryResponse,
    ...actualClassList,
  )
  @Post()
  @ApiCreatedResponse({ type: ActionResponsePrimary })
  async create(@Body() createUserDto: CreateUserRequest) {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOkResponse({
    content: {
      'application/json': {
        examples: userQueryResponses,
      },
    },
  })
  async findAll(@Query() query: UserQuery, @Req() req: Request) {
    console.log(req.url, query);
    const results = await this.usersService.findAll(query);

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

  @Get(':id')
  @ApiOkResponse({
    content: {
      'application/json': {
        schema: userResponseSchema,
        examples: userResponseExamples,
      },
    },
  })
  async findOne(
    @Param('id') id: number,
    @Query('responseType') responseType: UserResponseEnumType,
  ) {
    // TODO: implement guards for admin access stuff

    return await this.usersService.findOne(id, responseType);
  }

  @Patch(':id')
  @ApiCreatedResponse({ type: ActionResponsePrimary })
  async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserInfo) {
    return await this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiCreatedResponse({ type: ActionResponsePrimary })
  async remove(@Param('id') id: number) {
    return await this.usersService.remove(id);
  }
}
