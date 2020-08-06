import { Injectable, Inject } from '@nestjs/common';
import { arrayToInfiniteGenerator } from '../../../shared/helper';

@Injectable()
export class RekognitionNounService {

	private readonly nounsGen = arrayToInfiniteGenerator<string>(this.nouns);

	constructor(
		@Inject('rekognitionNouns') private readonly nouns: string[],
	) { }

	public next(): string {
		return this.nounsGen.next().value;
	}
}
