import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class ActionResponsePrimary {
  @ApiProperty()
  @IsNumber()
  id: number;
}

export abstract class ActionResponseComposite {
  [x: string]: Number;
}
