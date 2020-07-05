import { Injectable } from '@nestjs/common';
import { Lobby, GameRound } from 'src/game/models';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GameRoundService {
  constructor() {}

  public async initGameRound(
    lobby: Lobby,
    duration: number,
    rounds: number,
  ): Promise<[GameRound]> {
    const id = uuidv4();
    const game = new GameRound(
      id,
      new Date().getTime(),
      lobby,
      duration,
      rounds,
    );
    return [game];
  }
}
