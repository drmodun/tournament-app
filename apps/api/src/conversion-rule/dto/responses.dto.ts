import { ApiResponseProperty } from '@nestjs/swagger';

export class ConversionRuleResponse {
  @ApiResponseProperty()
  id: number;

  @ApiResponseProperty()
  type: string;

  @ApiResponseProperty()
  strategy: string;

  @ApiResponseProperty()
  source: number;

  @ApiResponseProperty()
  destination: number;

  @ApiResponseProperty()
  points: number;

  @ApiResponseProperty()
  from?: number;

  @ApiResponseProperty()
  to?: number;

  @ApiResponseProperty()
  minPoints?: number;

  @ApiResponseProperty()
  maxPoints?: number;

  @ApiResponseProperty()
  pointsPerPlace?: number;

  @ApiResponseProperty()
  appliedAt?: Date;

  @ApiResponseProperty()
  createdBy?: number;

  @ApiResponseProperty()
  createdAt: Date;
}
