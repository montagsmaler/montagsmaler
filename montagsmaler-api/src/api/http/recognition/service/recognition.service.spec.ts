import { Test, TestingModule } from '@nestjs/testing';
import { RecognitionService } from './recognition.service';
import { rekognitionProviders } from './rekognition.provider'

describe('RecognitionService', () => {
	let service: RecognitionService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [...rekognitionProviders,RecognitionService],
		})
		.overrideProvider('rekognition_provider')
		.useValue({})
		.compile();

		service = module.get<RecognitionService>(RecognitionService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
