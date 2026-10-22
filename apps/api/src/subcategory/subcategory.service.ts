import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  BaseSubcategoryResponseType,
  ICreateSubcategoryRequest,
  IUpdateSubcategoryRequest,
  SubcategoryResponsesEnum,
  SubcategoryResponsesEnumType,
} from '@tournament-app/types';
import { SubcategoryDrizzleRepository } from './subcategory.repository';
import { SubcategoryQuery } from './dto/requests.dto';

@Injectable()
export class SubcategoryService {
  constructor(private readonly repository: SubcategoryDrizzleRepository) {}

  async create(createSubcategoryDto: ICreateSubcategoryRequest) {
    const subcategory =
      await this.repository.createEntity(createSubcategoryDto);

    if (!subcategory[0]) {
      throw new UnprocessableEntityException('Subcategory creation failed');
    }

    return subcategory[0];
  }

  async findAll<TResponseType extends BaseSubcategoryResponseType>(
    query: SubcategoryQuery,
  ): Promise<TResponseType[]> {
    const { responseType = SubcategoryResponsesEnum.BASE, ...queryParams } =
      query;

    const results = await this.repository.getQuery({
      ...queryParams,
      responseType,
    });

    return results as TResponseType[];
  }

  async findOne<TResponseType extends BaseSubcategoryResponseType>(
    id: number,
    responseType: SubcategoryResponsesEnumType = SubcategoryResponsesEnum.BASE,
  ): Promise<TResponseType> {
    const results = await this.repository.getSingleQuery(id, responseType);

    if (!results?.length) {
      throw new NotFoundException(`Subcategory with ID ${id} not found`);
    }

    return results[0] as TResponseType;
  }

  async update(id: number, updateSubcategoryDto: IUpdateSubcategoryRequest) {
    const { categoryId } = updateSubcategoryDto;

    // Tournaments keep their subcategory inside their own category
    if (categoryId !== undefined) {
      const currentCategoryId = await this.repository.getCategoryId(id);

      if (currentCategoryId === undefined) {
        throw new NotFoundException(`Subcategory with ID ${id} not found`);
      }

      if (
        categoryId !== currentCategoryId &&
        (await this.repository.countTournaments(id)) > 0
      ) {
        throw new ConflictException(
          'Tournaments use this subcategory, so it cannot move to another category',
        );
      }
    }

    const subcategory = await this.repository.updateEntity(
      id,
      updateSubcategoryDto,
    );

    if (!subcategory[0]) {
      throw new NotFoundException(`Subcategory with ID ${id} not found`);
    }

    return subcategory[0];
  }

  async remove(id: number) {
    const action = await this.repository.deleteEntity(id);

    if (!action[0]) {
      throw new NotFoundException(`Subcategory with ID ${id} not found`);
    }

    return action[0];
  }

  // A tournament's subcategory has to belong to the tournament's category
  async checkBelongsToCategory(subcategoryId: number, categoryId: number) {
    if (!(await this.repository.isInCategory(subcategoryId, categoryId))) {
      throw new BadRequestException(
        `Subcategory ${subcategoryId} is not in category ${categoryId}`,
      );
    }
  }
}
