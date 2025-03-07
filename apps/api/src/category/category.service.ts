import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  ICreateCategoryRequest,
  IUpdateCategoryRequest,
  CategoryResponsesEnum,
  CategoryReturnTypesEnumType,
  BaseCategoryResponseType,
} from '@tournament-app/types';
import { CategoryDrizzleRepository } from './category.repository';
import { CategoryQuery } from './dto/requests.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly repository: CategoryDrizzleRepository) {}

  async create(createCategoryDto: ICreateCategoryRequest) {
    const category = await this.repository.createEntity({
      ...createCategoryDto,
    });

    if (!category[0]) {
      throw new UnprocessableEntityException('Category creation failed');
    }

    return category[0];
  }

  async findAll<TResponseType extends BaseCategoryResponseType>(
    query: CategoryQuery,
  ): Promise<TResponseType[]> {
    const { responseType = CategoryResponsesEnum.BASE, ...queryParams } = query;
    const queryFunction = this.repository.getQuery({
      ...queryParams,
      responseType,
    });

    const results = await queryFunction;
    return results as TResponseType[];
  }

  async findOne<TResponseType extends BaseCategoryResponseType>(
    id: number,
    responseType: CategoryReturnTypesEnumType = CategoryResponsesEnum.BASE,
  ): Promise<TResponseType> {
    const results = await this.repository.getSingleQuery(id, responseType);

    if (!results?.length) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return results[0] as TResponseType;
  }

  async update(id: number, updateCategoryDto: IUpdateCategoryRequest) {
    const category = await this.repository.updateEntity(id, updateCategoryDto);

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category[0];
  }

  async remove(id: number) {
    const action = await this.repository.deleteEntity(id);

    if (!action[0]) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return action[0];
  }

  async categoryAutoComplete(
    search: string,
    pageSize: number = 10,
    page: number = 1,
  ) {
    return await this.repository.categoryAutoComplete(search, pageSize, page);
  }
}
