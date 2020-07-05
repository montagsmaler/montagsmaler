import { Injectable } from '@nestjs/common';
import { Lobby, GameRound, GameOverEvent } from 'src/game/models';
import { v4 as uuidv4 } from 'uuid';
import { KeyValueService } from '../../../shared/redis/keyvalue/service/keyvalue.service';
import { PubSubService } from '../../../shared/redis/pubsub/service/pubsub.service';
import { GameEvent } from 'src/api/ws/game/game-events';

const ACTIVE_GAMES = 'ACTIVE_GAMES';
const GAME = 'game';
const HOUR_IN_SECONDS = 3600;

@Injectable()
export class GameRoundService {
  constructor(
    private readonly pubSubService: PubSubService,
    private readonly keyValueService: KeyValueService,
  ) {}

  public async initGameRound(
    lobby: Lobby,
    duration: number,
    rounds: number,
  ): Promise<[GameRound]> {
    const id = uuidv4();
    try {
      const game = new GameRound(
        id,
        new Date().getTime(),
        lobby,
        duration,
        rounds,
      );
      await Promise.all([
        this.setGameRound(id, game),
        this.keyValueService.addToSet<string>(ACTIVE_GAMES, id),
      ]);

      return [game];
    } catch (e) {
      throw new Error('Failed to init Game');
    }
  }

  private sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public async startGameLoop(id: string): Promise<void> {
    let game: GameRound;
    try {
      game = await this.getGameRound(id);
      for (let i = 0; i < game.rounds; i++) {
        // await this.pubGameEvent(id, new NewGameRound(i))]
        await this.sleep(2000);
        console.log('new round');
      }
    } catch (e) {
      throw new Error(e);
    }
  }

  private async pubGameRoundEvent(id: string, event: GameEvent): Promise<void> {
    try {
      await this.pubSubService.pubToChannel<GameEvent>(id, event);
    } catch (err) {
      throw new Error('Could not public LobbyEvent.');
    }
  }

  private async setGameRound(id: string, game: GameRound): Promise<void> {
    try {
      await this.keyValueService.set<GameRound>(
        GAME + id,
        game,
        HOUR_IN_SECONDS << 1,
      );
    } catch (err) {
      throw new Error('Could not set Game.');
    }
  }

  public async getGameRound(id: string): Promise<GameRound> {
    try {
      return await this.keyValueService.get<GameRound>(GAME + id);
    } catch (err) {
      throw new Error('Game not found.');
    }
  }
}
