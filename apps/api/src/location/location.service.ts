import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  ICreateLocationRequest,
  IUpdateLocationRequest,
  LocationResponsesEnum,
  LocationResponseEnumType,
  BaseLocationResponse,
} from '@tournament-app/types';
import { LocationDrizzleRepository } from './location.repository';
import { LocationQuery } from './dto/requests';

@Injectable()
export class LocationService {
  constructor(private readonly repository: LocationDrizzleRepository) {}

  async getLocationByApiId(apiId: string) {
    const location = await this.repository.getQuery({
      apiId,
    } as LocationQuery);

    return location[0];
  }

  async create(createLocationDto: ICreateLocationRequest) {
    const potentialLocation = await this.getLocationByApiId(
      createLocationDto.apiId,
    );

    if (potentialLocation) {
      return potentialLocation;
    }

    const location = await this.repository.createEntity({
      ...createLocationDto,
      coordinates: [createLocationDto.lng, createLocationDto.lat],
    });

    if (!location[0]) {
      throw new UnprocessableEntityException('Location creation failed');
    }

    return location[0];
  }

  async findAll<TResponseType extends BaseLocationResponse>(
    query: LocationQuery,
  ): Promise<TResponseType[]> {
    const { responseType = LocationResponsesEnum.BASE, ...queryParams } = query;
    const queryFunction = this.repository.getQuery({
      ...queryParams,
      responseType,
    });

    const results = await queryFunction;
    return results as TResponseType[];
  }

  async findOne<TResponseType extends BaseLocationResponse>(
    id: number,
    responseType: LocationResponseEnumType = LocationResponsesEnum.BASE,
  ): Promise<TResponseType> {
    const results = await this.repository.getSingleQuery(id, responseType);

    if (!results?.length) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }

    return results[0] as TResponseType;
  }

  async getMap() {
    const locations = await this.repository.getMap();

    return locations;
  }

  async update(id: number, updateLocationDto: IUpdateLocationRequest) {
    const locationToUpdate = await this.repository.getSingleQuery(id);

    if (!(locationToUpdate?.length > 0)) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }

    const location = await this.repository.updateEntity(id, {
      ...updateLocationDto,
      ...(updateLocationDto.lng &&
        updateLocationDto.lat && {
          coordinates: [updateLocationDto.lng, updateLocationDto.lat],
        }),
    });

    if (!location) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }

    return location[0];
  }

  async remove(id: number) {
    const action = await this.repository.deleteEntity(id);

    if (!action[0]) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }

    return action[0];
  }
}
