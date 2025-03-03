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
  @ApiCreatedResponse({ type: ActionResponsePrimary })
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
  @ApiOkResponse({ type: [MiniUserResponseWithProfilePicture] })
  async userAutoComplete(
    @Param('search') search: string,
    @Query() query: PaginationOnly,
  ) {
    return await this.usersService.userAutoComplete(search, query.pageSize);
  }

  @Post()
  @ApiCreatedResponse({ type: ActionResponsePrimary })
  async create(@Body() createUserDto: CreateUserRequest) {
    return await this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch()
  @ApiOkResponse({ type: ActionResponsePrimary })
  async updateMe(
    @CurrentUser() user: ValidatedUserDto,
    @Body() editedUserBody: UpdateUserInfo,
  ) {
    return await this.usersService.update(user.id, editedUserBody);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete()
  @ApiOkResponse({ type: MiniUserResponse })
  async deleteMe(@CurrentUser() user: ValidatedUserDto) {
    return await this.usersService.remove(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOkResponse({ type: ExtendedUserResponse })
  async findMe(@CurrentUser() user: ValidatedUserDto) {
    return await this.usersService.findOne<ExtendedUserResponse>(
      user.id,
      UserResponsesEnum.EXTENDED,
    );
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
    @Param('id', ParseIntPipe) id: number,
    @Query('responseType')
    responseType?: UserResponseEnumType,
  ) {
    return await this.usersService.findOne(id, responseType);
  }

  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiCreatedResponse({ type: ActionResponsePrimary })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserInfo,
  ) {
    return await this.usersService.update(id, updateUserDto);
  }

  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiCreatedResponse({ type: ActionResponsePrimary })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.remove(id);
  }
}
