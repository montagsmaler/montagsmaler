import { GameRound } from './game-round';

export interface GameRoundEvent {
  getTrigger(): 'SYSTEM' | GameRound;
  getMessage(): string;
}
