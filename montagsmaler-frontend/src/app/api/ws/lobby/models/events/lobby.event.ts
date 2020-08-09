import { Player } from '../player';

export interface LobbyEvent {
  readonly id: number;
  readonly player: Player;
}
