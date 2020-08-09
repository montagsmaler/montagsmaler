import { Player } from '../player';
import { LobbyEvent } from './lobby.event';

export class LobbyConsumedEvent implements LobbyEvent {
  readonly id: number;
  readonly player: Player;
  //readonly game: Game;
}
