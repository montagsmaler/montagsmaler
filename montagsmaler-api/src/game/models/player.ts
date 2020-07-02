import { JSONSerializable } from '../../shared/serializable';

@JSONSerializable()
export class Player {
	private score = 0;

	constructor(public readonly id: string, public readonly name: string) { }
}