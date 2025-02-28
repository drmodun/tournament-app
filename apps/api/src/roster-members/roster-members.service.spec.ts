import { Test, TestingModule } from '@nestjs/testing';
import { RosterMembersService } from './roster-members.service';

describe('RosterMembersService', () => {
  let service: RosterMembersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RosterMembersService],
    }).compile();

    service = module.get<RosterMembersService>(RosterMembersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
