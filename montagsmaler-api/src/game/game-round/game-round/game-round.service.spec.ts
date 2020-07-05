import { Test, TestingModule } from '@nestjs/testing';
import { GameRoundService } from './game-round.service';

describe('GameRoundService', () => {
  let service: GameRoundService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameRoundService],
    }).compile();

    service = module.get<GameRoundService>(GameRoundService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
