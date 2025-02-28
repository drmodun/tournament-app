import { Test, TestingModule } from '@nestjs/testing';
import { RosterMembersController } from './roster-members.controller';
import { RosterMembersService } from './roster-members.service';

describe('RosterMembersController', () => {
  let controller: RosterMembersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RosterMembersController],
      providers: [RosterMembersService],
    }).compile();

    controller = module.get<RosterMembersController>(RosterMembersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
