import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LfgService } from './lfg.service';

@Controller('lfg')
export class LfgController {
  constructor(private readonly lfgService: LfgService) {}
}
