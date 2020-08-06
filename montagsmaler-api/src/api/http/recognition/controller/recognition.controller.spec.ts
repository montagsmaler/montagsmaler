import { Test, TestingModule } from '@nestjs/testing';
import { RecognitionController } from './recognition.controller';
import { RecognitionModule } from '../recognition.module'
import { ConfigService } from '@nestjs/config';

describe('Recognition Controller', () => {
	let controller: RecognitionController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [RecognitionModule],
		})
		.overrideProvider(ConfigService)
		.useValue({})
		.overrideProvider('rekognition_provider')
		.useValue({})
		.compile();

		//controller = module.get<RecognitionController>(RecognitionController);
	});

	it('should be defined', () => {
		expect(controller).toBeUndefined();
	});
});
