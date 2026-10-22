import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  ICreateTournamentRequest,
  IUpdateTournamentRequest,
  TournamentResponsesEnum,
  BaseTournamentResponseType,
  IMiniTournamentResponseWithLogo,
} from '@tournament-app/types';
import { TournamentDrizzleRepository } from './tournament.repository';
import { TournamentQuery } from './dto/requests.dto';
import {
  AnyTournamentReturnType,
  ITournamentWithRelations,
  TournamentDtosEnum,
  TournamentReturnTypesEnumType,
} from './types';
import { PaginationOnly } from 'src/base/query/baseQuery';
import { SubcategoryService } from 'src/subcategory/subcategory.service';

@Injectable()
export class TournamentService {
  constructor(
    private readonly repository: TournamentDrizzleRepository,
    private readonly subcategoryService: SubcategoryService,
  ) {}

  async create(createTournamentDto: ICreateTournamentRequest) {
    if (createTournamentDto.subcategoryId) {
      await this.subcategoryService.checkBelongsToCategory(
        createTournamentDto.subcategoryId,
        createTournamentDto.categoryId,
      );
    }

    const tournament = await this.repository.createEntity({
      ...createTournamentDto,
    });

    if (!tournament[0]) {
      throw new UnprocessableEntityException('Tournament creation failed');
    }

    return tournament[0];
  }

  async findAll<TResponseType extends BaseTournamentResponseType>(
    query: TournamentQuery,
  ): Promise<TResponseType[]> {
    const { responseType = TournamentResponsesEnum.BASE, ...queryParams } =
      query;
    const queryFunction = this.repository.getQuery({
      ...queryParams,
      responseType,
    });

    const results = await queryFunction;
    return results as TResponseType[];
  }

  async findOne<TResponseType extends AnyTournamentReturnType>(
    id: number,
    responseType: TournamentReturnTypesEnumType = TournamentResponsesEnum.BASE,
  ): Promise<TResponseType> {
    const results = await this.repository.getSingleQuery(id, responseType);

    if (!results.length) {
      throw new NotFoundException(`Tournament with ID ${id} not found`);
    }

    return results[0] as TResponseType;
  }

  async update(id: number, updateTournamentDto: IUpdateTournamentRequest) {
    const tournament = await this.repository.updateEntity(
      id,
      await this.withValidSubcategory(id, updateTournamentDto),
    );

    if (!tournament[0]) {
      throw new NotFoundException(`Tournament with ID ${id} not found`);
    }

    return tournament[0];
  }

  // A subcategory sent with the update must be in the tournament's (possibly new) category. Moving to
  // another category without naming a subcategory drops one that does not belong there.
  private async withValidSubcategory(
    id: number,
    updateTournamentDto: IUpdateTournamentRequest,
  ): Promise<IUpdateTournamentRequest> {
    const { categoryId, subcategoryId } = updateTournamentDto;

    if (!categoryId && !subcategoryId) {
      return updateTournamentDto;
    }

    const current = await this.findOne<ITournamentWithRelations>(
      id,
      TournamentDtosEnum.WITH_RELATIONS,
    );
    const finalCategoryId = categoryId ?? current.categoryId;

    if (subcategoryId) {
      await this.subcategoryService.checkBelongsToCategory(
        subcategoryId,
        finalCategoryId,
      );

      return updateTournamentDto;
    }

    if (
      subcategoryId === undefined &&
      current.subcategoryId &&
      finalCategoryId !== current.categoryId
    ) {
      return { ...updateTournamentDto, subcategoryId: null };
    }

    return updateTournamentDto;
  }

  async remove(id: number) {
    const action = await this.repository.deleteEntity(id);

    if (!action[0]) {
      throw new NotFoundException(`Tournament with ID ${id} not found`);
    }

    return action[0];
  }

  async autoComplete(
    search: string,
    query?: PaginationOnly,
  ): Promise<IMiniTournamentResponseWithLogo[]> {
    const results = await this.repository.getAutoComplete(
      search,
      query?.pageSize,
      query?.page,
    );

    return results as IMiniTournamentResponseWithLogo[];
  }

  async getManagedTournaments(userId: number, pagination?: PaginationOnly) {
    const tournaments = await this.repository.getManagedTournaments(
      userId,
      pagination,
    );
    return tournaments;
  }
}
