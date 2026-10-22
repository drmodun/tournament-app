import { Module } from '@nestjs/common';
import { SubcategoryController } from './subcategory.controller';
import { SubcategoryDrizzleRepository } from './subcategory.repository';
import { SubcategoryService } from './subcategory.service';

@Module({
  controllers: [SubcategoryController],
  providers: [SubcategoryService, SubcategoryDrizzleRepository],
  exports: [SubcategoryService],
})
export class SubcategoryModule {}
