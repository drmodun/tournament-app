import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class ActionResponsePrimary {
  @ApiResponseProperty()
  @IsNumber()
  id: number;
}

export abstract class ActionResponseComposite {
  [x: string]: Number;
}
