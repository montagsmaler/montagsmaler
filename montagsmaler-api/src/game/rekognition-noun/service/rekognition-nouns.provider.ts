import { Provider } from '@nestjs/common';

export const rekognitionNounProvider: Provider[] = [
	{
		provide: 'rekognitionNouns',
		useFactory: () => ['Bird', 'Dog', 'Cat'],
	},
];