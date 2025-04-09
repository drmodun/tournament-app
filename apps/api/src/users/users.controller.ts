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
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ICreateUserRequest,
  IQueryMetadata,
  UserResponseEnumType,
  UserResponsesEnum,
} from '@tournament-app/types';
import { MetadataMaker } from '../base/static/makeMetadata';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
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
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from 'src/auth/guards/admin-auth.guard';
import { CurrentUser } from 'src/base/decorators/currentUser.decorator';
import { ValidatedUserDto } from 'src/auth/dto/validatedUser.dto';
import { PaginationOnly } from 'src/base/query/baseQuery';

@ApiTags('users')
@Controller('users')
/**
 * Controller class for managing user-related operations.
 */
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('fake')
  @ApiOperation({
    summary: 'Creates a fake user for seeding or custom tourney purposes.',
  })
  @ApiCreatedResponse({
    description: 'Creates a fake user for seeding or custom tourney purposes.',
    type: ActionResponsePrimary,
  })
  async createFake(@Body() createUserDto: ICreateUserRequest) {
    return await this.usersService.create({
      ...createUserDto,
      isFake: true,
      email: crypto.randomUUID(),
      dateOfBirth: new Date(),
    });
  }

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
  @Get('auto-complete/:search')
  @ApiOperation({
    summary: 'Returns a list of users that can be auto-completed based on the search term.',
  })
  @ApiOkResponse({
    description:
      'Returns a list of users that can be auto-completed based on the search term.',
    type: [MiniUserResponseWithProfilePicture],
  })
  async userAutoComplete(
    @Param('search') search: string,
    @Query() query: PaginationOnly,
  ) {
    return await this.usersService.userAutoComplete(search, query.pageSize);
  }

  @Post()
  @ApiOperation({
    summary: 'Creates a new user with the provided details.',
  })
  @ApiCreatedResponse({
    description: 'Creates a new user with the provided details.',
    type: ActionResponsePrimary,
  })
  async create(@Body() createUserDto: CreateUserRequest) {
    return await this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch()
  @ApiOperation({
    summary: 'Updates the current user profile with the provided details.',
  })
  @ApiOkResponse({
    description: 'Updates the current user profile with the provided details.',
    type: ActionResponsePrimary,
  })
  async updateMe(
    @CurrentUser() user: ValidatedUserDto,
    @Body() editedUserBody: UpdateUserInfo,
  ) {
    return await this.usersService.update(user.id, editedUserBody);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete()
  @ApiOperation({
    summary: 'Deletes the current user profile.',
  })
  @ApiOkResponse({
    description: 'Deletes the current user profile.',
    type: MiniUserResponse,
  })
  async deleteMe(@CurrentUser() user: ValidatedUserDto) {
    return await this.usersService.remove(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({
    summary: 'Retrieves the current user profile.',
  })
  @ApiOkResponse({
    description: 'Retrieves the current user profile.',
    type: ExtendedUserResponse,
  })
  async findMe(@CurrentUser() user: ValidatedUserDto) {
    return await this.usersService.findOne<ExtendedUserResponse>(
      user.id,
      UserResponsesEnum.EXTENDED,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieves a list of users based on the provided query parameters.',
  })
  @ApiOkResponse({
    description:
      'Retrieves a list of users based on the provided query parameters.',
    content: {
      'application/json': {
        examples: userQueryResponses,
      },
    },
  })
  async findAll(@Query() query: UserQuery, @Req() req: Request) {
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
  @ApiOperation({
    summary: 'Returns details of a single user specified by the user ID.',
  })
  @ApiOkResponse({
    description: 'Returns details of a single user specified by the user ID.',
    content: {
      'application/json': {
        schema: userResponseSchema,
        examples: userResponseExamples,
      },
    },
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('responseType')
    responseType?: UserResponseEnumType,
  ) {
    return await this.usersService.findOne(id, responseType);
  }

  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({
    summary: 'Updates the details of an existing user specified by the user ID.',
  })
  @ApiCreatedResponse({
    description:
      'Updates the details of an existing user specified by the user ID.',
    type: ActionResponsePrimary,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserInfo,
  ) {
    return await this.usersService.update(id, updateUserDto);
  }

  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({
    summary: 'Deletes a user specified by the user ID.',
  })
  @ApiCreatedResponse({
    description: 'Deletes a user specified by the user ID.',
    type: ActionResponsePrimary,
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.remove(id);
  }
}
