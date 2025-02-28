import { ApiResponseProperty } from '@nestjs/swagger';
import {
  IGroupRequirementsResponse,
  IGroupResponse,
  ILFPResponse,
  ILocationResponse,
  IMiniLFPResponse,
} from '@tournament-app/types';
import { Type } from 'class-transformer';
import { GroupResponse } from 'src/group/dto/responses.dto';
import { GroupRequirementsResponseDto } from 'src/group/requirements/dto/responses';
import { LocationResponse } from 'src/location/dto/responses';
export class LFPResponse implements ILFPResponse {
  @ApiResponseProperty()
  id: number;

  @ApiResponseProperty()
  groupId: number;

  @ApiResponseProperty()
  @Type(() => GroupResponse)
  group: IGroupResponse;

  @ApiResponseProperty()
  message: string;

  @ApiResponseProperty()
  createdAt: string;

  @ApiResponseProperty()
  @Type(() => GroupRequirementsResponseDto)
  requirements: IGroupRequirementsResponse;

  @ApiResponseProperty()
  @Type(() => LocationResponse)
  location: ILocationResponse;
}

export class MiniLFPResponse implements IMiniLFPResponse {
  @ApiResponseProperty()
  id: number;

  @ApiResponseProperty()
  groupId: number;

  @ApiResponseProperty()
  message: string;

  @ApiResponseProperty()
  createdAt: string;
}
