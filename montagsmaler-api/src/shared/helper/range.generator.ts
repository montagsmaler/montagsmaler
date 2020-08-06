import { sleep } from "./sleep.helper";

export function* range(start: number, end: number) {
	yield start;
	if (start === end) return;
	yield* range(start + 1, end);
}

export async function* sleepRange(start: number, end: number, sleepInMs: number) {
	for (const idx of range(start, end)) {
		await sleep(sleepInMs);
		yield idx;
	}
}