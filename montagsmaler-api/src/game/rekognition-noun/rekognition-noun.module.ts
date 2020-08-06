import { Module } from '@nestjs/common';
import { RekognitionNounService } from './service/rekognition-noun.service';
import { rekognitionNounProvider } from './service/rekognition-nouns.provider';

@Module({
	providers: [...rekognitionNounProvider, RekognitionNounService],
	exports: [...rekognitionNounProvider, RekognitionNounService],
})
export class RekognitionNounModule { }
