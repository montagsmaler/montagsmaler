import { JSONSerializable } from '../../../shared/serializable';

@JSONSerializable()
export class Player {
  constructor(public readonly id: string, public readonly name: string) {}
}
