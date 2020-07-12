import { Test, TestingModule } from '@nestjs/testing';
import { RekognitionNounService } from './rekognition-noun.service';
import { rekognitionNounProvider } from './rekognition-nouns.provider';

describe('RekognitionNounService', () => {
	let service: RekognitionNounService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [...rekognitionNounProvider, RekognitionNounService],
		})
			.overrideProvider('rekognitionNouns').useValue(['ping', 'pong'])
			.compile();

		service = module.get<RekognitionNounService>(RekognitionNounService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('should ping pong', () => {
		expect(service.next()).toEqual('ping');
		expect(service.next()).toEqual('pong');
		expect(service.next()).toEqual('ping');
		expect(service.next()).toEqual('pong');
		expect(service.next()).toEqual('ping');
		expect(service.next()).toEqual('pong');
	});

});
