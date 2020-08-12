import { Player } from '../player';
import { LobbyEvent } from './lobby.event';

export interface LobbyPlayerJoinedEvent extends LobbyEvent {

  readonly id: number;
  readonly player: Player;
}
