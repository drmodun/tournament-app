import { Test, TestingModule } from '@nestjs/testing';
import { LfgController } from './lfg.controller';
import { LfgService } from './lfg.service';

describe('LfgController', () => {
  let controller: LfgController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LfgController],
      providers: [LfgService],
    }).compile();

    controller = module.get<LfgController>(LfgController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
