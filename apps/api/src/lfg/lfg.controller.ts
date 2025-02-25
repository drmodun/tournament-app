import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LfgService } from './lfg.service';
import { CreateLfgDto } from './dto/create-lfg.dto';
import { UpdateLfgDto } from './dto/update-lfg.dto';

@Controller('lfg')
export class LfgController {
  constructor(private readonly lfgService: LfgService) {}

  @Post()
  create(@Body() createLfgDto: CreateLfgDto) {
    return this.lfgService.create(createLfgDto);
  }

  @Get()
  findAll() {
    return this.lfgService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lfgService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLfgDto: UpdateLfgDto) {
    return this.lfgService.update(+id, updateLfgDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lfgService.remove(+id);
  }
}
