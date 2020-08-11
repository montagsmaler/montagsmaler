import { Player } from '../player';
import { LobbyEvent } from './lobby.event';

export class LobbyPlayerLeftEvent implements LobbyEvent {

  readonly id: number;
  readonly player: Player;
}
