import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class LinkVansyQuizRequest {
  @ApiProperty({ description: 'A Vansy quiz owned by the caller' })
  @IsUUID()
  quizId: string;
}
