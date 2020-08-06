import { Provider } from '@nestjs/common';

export const timeProvider: Provider[] = [
	{
		provide: 'SECOND_IN_MILLISECONDS',
		useValue: 1000,
	}
];