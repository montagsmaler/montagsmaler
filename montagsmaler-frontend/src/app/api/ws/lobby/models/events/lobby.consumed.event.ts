import { Player } from '../player';
import { LobbyEvent } from './lobby.event';
import { Game } from '../../../game/models';

export interface LobbyConsumedEvent extends LobbyEvent {
  readonly id: number;
  readonly player: Player;
  readonly game: Game;
}
