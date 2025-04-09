import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
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
  @ApiProperty({
    description: 'Unique identifier for the LFP',
    example: 123,
    readOnly: true,
  })
  id: number;

  @ApiProperty({
    description: 'ID of the group',
    example: 456,
    readOnly: true,
  })
  groupId: number;

  @ApiProperty({
    description: 'Group affiliated with the LFP',
    type: () => GroupResponse,
    readOnly: true,
  })
  @Type(() => GroupResponse)
  group: IGroupResponse;

  @ApiProperty({
    description: 'Message for the LFP',
    example: 'Looking for players for our competitive team',
    readOnly: true,
  })
  message: string;

  @ApiProperty({
    description: 'Date when the LFP was created',
    example: '2023-01-15T12:30:45Z',
    readOnly: true,
  })
  createdAt: string;

  @ApiProperty({
    description: 'Requirements for the group',
    type: () => GroupRequirementsResponseDto,
    readOnly: true,
  })
  @Type(() => GroupRequirementsResponseDto)
  requirements: IGroupRequirementsResponse;

  @ApiResponseProperty()
  @Type(() => LocationResponse)
  location: ILocationResponse;
}

export class MiniLFPResponse implements IMiniLFPResponse {
  @ApiProperty({
    description: 'Unique identifier for the LFP',
    example: 123,
    readOnly: true,
  })
  id: number;

  @ApiProperty({
    description: 'ID of the group',
    example: 456,
    readOnly: true,
  })
  groupId: number;

  @ApiProperty({
    description: 'Message for the LFP',
    example: 'Looking for players for our competitive team',
    readOnly: true,
  })
  message: string;

  @ApiProperty({
    description: 'Date when the LFP was created',
    example: '2023-01-15T12:30:45Z',
    readOnly: true,
  })
  createdAt: string;
}
