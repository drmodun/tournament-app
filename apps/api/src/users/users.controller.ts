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
  CreateUserRequest,
  FullUserQuery,
  QueryMetadata,
  UpdateUserInfo,
  UserResponseEnumType,
} from '@tournament-app/types';
import { MetadataMaker } from '../base/static/makeMetadata';
import { FullQuery } from '../base/decorators/fullQuery.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserRequest) {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  async findAll(@FullQuery() query: FullUserQuery, @Req() req: Request) {
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
