import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  IQueryMetadata,
  SubcategoryResponsesEnumType,
} from '@tournament-app/types';
import { AdminAuthGuard } from 'src/auth/guards/admin-auth.guard';
import { ActionResponsePrimary } from 'src/base/actions/actionResponses.dto';
import { MetadataMaker } from 'src/base/static/makeMetadata';
import {
  CreateSubcategoryRequest,
  SubcategoryQuery,
  UpdateSubcategoryRequest,
} from './dto/requests.dto';
import {
  SubcategoryMiniResponse,
  SubcategoryResponse,
  SubcategoryResponseExtended,
} from './dto/responses.dto';
import { SubcategoryService } from './subcategory.service';

@ApiTags('subcategories')
@ApiExtraModels(
  SubcategoryMiniResponse,
  SubcategoryResponse,
  SubcategoryResponseExtended,
)
@Controller('subcategories')
export class SubcategoryController {
  constructor(private readonly subcategoryService: SubcategoryService) {}

  @Get()
  @ApiOkResponse({ type: [SubcategoryResponse] })
  async findAll(@Query() query: SubcategoryQuery, @Req() req: Request) {
    const results = await this.subcategoryService.findAll(query);

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

  @Get(':subcategoryId')
  @ApiOkResponse({ type: SubcategoryResponseExtended })
  async findOne(
    @Param('subcategoryId', ParseIntPipe) id: number,
    @Query('responseType') responseType?: SubcategoryResponsesEnumType,
  ) {
    return await this.subcategoryService.findOne(id, responseType);
  }

  @Post()
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Creates a new subcategory',
    type: ActionResponsePrimary,
  })
  async create(@Body() createSubcategoryDto: CreateSubcategoryRequest) {
    return await this.subcategoryService.create(createSubcategoryDto);
  }

  @Patch(':subcategoryId')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Updates a subcategory',
    type: ActionResponsePrimary,
  })
  async update(
    @Param('subcategoryId', ParseIntPipe) id: number,
    @Body() updateSubcategoryDto: UpdateSubcategoryRequest,
  ) {
    return await this.subcategoryService.update(id, updateSubcategoryDto);
  }

  @Delete(':subcategoryId')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Deletes a subcategory; its tournaments keep their category',
    type: ActionResponsePrimary,
  })
  async remove(@Param('subcategoryId', ParseIntPipe) id: number) {
    return await this.subcategoryService.remove(id);
  }
}
