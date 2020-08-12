import { Player } from '../player';
import { LobbyEvent } from './lobby.event';

export interface LobbyPlayerLeftEvent extends LobbyEvent {

  readonly id: number;
  readonly player: Player;
}
