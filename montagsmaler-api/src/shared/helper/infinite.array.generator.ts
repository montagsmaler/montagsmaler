export function* arrayToInfiniteGenerator<T>(array: T[]): Generator<T> {
	while (true) {
		for (const element of array) {
			yield element;
		}
	}
}