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

    if (!category) {
      throw new UnprocessableEntityException('Category creation failed');
    }

    return category[0].id;
  }

  async findAll<TResponseType extends CategoryReturnTypesEnumType>(
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

  async findOne<TResponseType extends CategoryReturnTypesEnumType>(
    id: number,
    responseType: CategoryReturnTypesEnumType = CategoryResponsesEnum.BASE,
  ): Promise<TResponseType> {
    const results = await this.repository.getSingleQuery(id, responseType);

    if (!results) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return results[0] as TResponseType;
  }

  async update(id: number, updateCategoryDto: IUpdateCategoryRequest) {
    const category = await this.repository.updateEntity(id, updateCategoryDto);

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async remove(id: number) {
    const action = await this.repository.deleteEntity(id);

    if (!action[0]) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return action[0];
  }
}
