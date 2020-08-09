import { Player } from '../player';
import { LobbyEvent } from './lobby.event';

export class LobbyPlayerJoinedEvent implements LobbyEvent {

  readonly id: number;
  readonly player: Player;
}
