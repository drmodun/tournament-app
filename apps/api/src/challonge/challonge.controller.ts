import { Controller } from '@nestjs/common';
import { ChallongeService } from './challonge.service';

@Controller('challonge')
export class ChallongeController {
  constructor(private readonly challongeService: ChallongeService) {}
}
