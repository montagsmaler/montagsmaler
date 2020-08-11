import { Player } from '../player';
import { LobbyEvent } from './lobby.event';
import { Game } from '../../../game/models';

export class LobbyConsumedEvent implements LobbyEvent {
  readonly id: number;
  readonly player: Player;
  readonly game: Game;
}
