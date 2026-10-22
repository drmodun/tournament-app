import { TournamentManagerGuard } from 'src/tournament/guards/tournament-manager.guard';
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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request as ExpressRequest } from 'express';
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
  ApiBody,
  ApiConsumes,
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
import { SessionOnly } from 'src/auth/guards/session-only.guard';
import { CurrentUser } from 'src/base/decorators/currentUser.decorator';
import { ValidatedUserDto } from 'src/auth/dto/validatedUser.dto';
import { PaginationOnly } from 'src/base/query/baseQuery';
import { BlobService } from 'src/infrastructure/blob/blob.service';
import { MAX_IMAGE_BYTES } from 'src/infrastructure/blob/imageType';
import { DirectoriesEnum } from 'src/infrastructure/blob/types';

@ApiTags('users')
@Controller('users')
/**
 * Controller class for managing user-related operations.
 */
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly blobService: BlobService,
  ) {}

  @UseGuards(TournamentManagerGuard)
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

  // Uploads need a signed-in user, so a new user's picture can come with the sign-up itself, as a
  // multipart form with the image in its profilePicture field
  @Post()
  @UseInterceptors(
    FileInterceptor('profilePicture', {
      limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
    }),
  )
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiBody({
    type: CreateUserRequest,
    description:
      'As JSON, or as a multipart form whose profilePicture field is a PNG, JPEG, GIF or WebP image of up to 5 MB',
  })
  @ApiCreatedResponse({ type: ActionResponsePrimary })
  async create(
    @Body() createUserDto: CreateUserRequest,
    @UploadedFile() profilePicture: { buffer?: Buffer } | undefined,
    @Req() request: ExpressRequest,
  ) {
    if (!profilePicture) {
      return await this.usersService.create(createUserDto);
    }

    const image = await this.blobService.uploadImage(
      profilePicture,
      DirectoriesEnum.AVATAR,
      request,
    );

    try {
      return await this.usersService.create({
        ...createUserDto,
        profilePicture: image.url,
      });
    } catch (error) {
      await this.blobService.deleteFile(image.key).catch(() => undefined);
      throw error;
    }
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

  // A leaked API token must not be able to delete the account
  @SessionOnly()
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
