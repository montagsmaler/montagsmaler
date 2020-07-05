import { Player } from './player';

export interface GameEvent {
  getTrigger(): 'GAME' | Player;
  getMessage(): string;
}
