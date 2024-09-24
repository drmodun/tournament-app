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
import { QueryMetadata, UserResponseEnumType } from '@tournament-app/types';
import { MetadataMaker } from '../base/static/makeMetadata';
import {
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
  refs,
} from '@nestjs/swagger';
import {
  CreateUserRequest,
  UpdateUserInfo,
  UserQuery,
} from './dto/requests.dto';
import { ActionResponsePrimary } from 'src/base/actions/actionResponses.dto';
import {
  AdminUserResponse,
  defaultExample,
  ExtendedUserResponse,
  MiniUserResponse,
  MiniUserResponseWithCountry,
  MiniUserResponseWithProfilePicture,
  UserResponse,
} from './dto/responses.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiExtraModels(
    MiniUserResponse,
    MiniUserResponseWithProfilePicture,
    MiniUserResponseWithCountry,
    UserResponse,
    ExtendedUserResponse,
    AdminUserResponse,
  )
  @Post()
  @ApiCreatedResponse({ type: ActionResponsePrimary })
  async create(@Body() createUserDto: CreateUserRequest) {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  async findAll(@Query() query: UserQuery, @Req() req: Request) {
    console.log(req.url, query);
    const results = await this.usersService.findAll(query);

    const metadata: QueryMetadata = MetadataMaker.makeMetadataFromQuery(
      query,
      results,
      req.url,
    );

    return {
      results,
      metadata,
    }; // TODO: Absolutely later make a static metadata making class
  }

  @Get(':id')
  @ApiOkResponse({
    schema: {
      anyOf: refs(
        MiniUserResponse,
        UserResponse,
        ExtendedUserResponse,
        AdminUserResponse,
        MiniUserResponseWithCountry,
        MiniUserResponseWithProfilePicture,
      ),
    },
    example: defaultExample,
  })
  async findOne(
    @Param('id') id: number,
    @Query('responseType') responseType: UserResponseEnumType,
  ) {
    // TODO: implement guards for admin access stuff

    return await this.usersService.findOne(id, responseType);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserInfo) {
    return await this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.usersService.remove(id);
  }
}
