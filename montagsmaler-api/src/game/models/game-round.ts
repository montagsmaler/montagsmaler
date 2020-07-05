import { Lobby } from './lobby';
import { JSONSerializable } from '../../shared/serializable';

@JSONSerializable()
export class GameRound {
  constructor(
    public readonly id: string,
    public readonly createdAt: number,
    public readonly lobby: Lobby,
    public readonly duration: number,
    public readonly rounds: number,
  ) {}
}
