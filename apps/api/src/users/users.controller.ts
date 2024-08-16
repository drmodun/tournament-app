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
  Links,
  Pagination,
  QueryMetadata,
  UpdateUserInfo,
  UserResponseEnumType,
} from '@tournament-app/types';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserRequest) {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  async findAll(@Query('query') query: FullUserQuery, @Req() req: Request) {
    const results = await this.usersService.findAll(query);

    const pagination: Pagination = {
      page: query.pagination.page,
      pageSize: query.pagination.pageSize,
      total: Math.ceil(results.length / query.pagination.pageSize),
      ...(query.returnFullCount && { total: results['value'] || 0 }),
    };

    const links: Links = {
      first: req.url.includes('page')
        ? req.url.replace(/page=\d+/, 'page=1')
        : `${req.url}?page=1`,
      prev: req.url.includes('page')
        ? req.url.replace(/page=\d+/, `page=${query.pagination.page - 1}`)
        : `${req.url}?page=${(query.pagination.page || 1) - 1}`,
      next: req.url.includes('page')
        ? req.url.replace(/page=\d+/, `page=${query.pagination.page + 1}`)
        : `${req.url}?page=${(query.pagination.page || 1) + 1}`,
    };

    const metadata: QueryMetadata = {
      pagination,
      links,
      query: query.query,
    };

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
