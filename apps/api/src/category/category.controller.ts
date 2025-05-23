import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import {
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryQuery,
} from './dto/requests.dto';
import {
  CategoryResponse,
  CategoryResponseExtended,
  CategoryMiniResponse,
  CategoryMiniResponseWithLogo,
} from './dto/responses.dto';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { categoryQueryResponses, categoryResponses } from './dto/examples';
import { CategoryResponsesEnum, IQueryMetadata } from '^tournament-app/types';
import { AdminAuthGuard } from 'src/auth/guards/admin-auth.guard';
import { MetadataMaker } from 'src/base/static/makeMetadata';
import { ActionResponsePrimary } from 'src/base/actions/actionResponses.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PaginationOnly } from 'src/base/query/baseQuery';

@ApiTags('categories')
@ApiExtraModels(
  CategoryMiniResponse,
  CategoryMiniResponseWithLogo,
  CategoryResponse,
  CategoryResponseExtended,
)
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('auto-complete/:search')
  @ApiOkResponse({ type: [CategoryMiniResponseWithLogo] })
  async categoryAutoComplete(
    @Param('search') search: string,
    @Query() query: PaginationOnly,
  ) {
    return await this.categoryService.categoryAutoComplete(
      search,
      query.pageSize,
      query.page,
    );
  }

  @Get()
  @ApiOkResponse({
    content: {
      'application/json': {
        examples: categoryQueryResponses.responses,
      },
    },
  })
  async findAll(@Query() query: CategoryQuery, @Req() req: Request) {
    const results = await this.categoryService.findAll(query);

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

  @Get(':categoryId')
  @ApiOkResponse({
    description: 'Returns a single category',
    schema: { examples: categoryResponses },
  })
  async findOne(
    @Param('categoryId', ParseIntPipe) id: number,
    @Query('responseType') responseType?: CategoryResponsesEnum,
  ) {
    return await this.categoryService.findOne(id, responseType);
  }

  @Post()
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Creates a new category',
    type: ActionResponsePrimary,
  })
  async create(@Body() createCategoryDto: CreateCategoryRequest) {
    return await this.categoryService.create(createCategoryDto);
  }

  @Patch(':categoryId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Updates a category',
    type: ActionResponsePrimary,
  })
  async update(
    @Param('categoryId', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryRequest,
  ) {
    return await this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':categoryId')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Deletes a category',
    type: ActionResponsePrimary,
  })
  async remove(@Param('categoryId', ParseIntPipe) id: number) {
    return await this.categoryService.remove(id);
  }
}
