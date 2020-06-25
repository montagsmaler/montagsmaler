import { Module } from '@nestjs/common';
import { RecognitionService } from './service/recognition.service';
import { RecognitionController } from './controller/recognition.controller';
import { ConfigModule } from '@nestjs/config';
import { ValidationModule } from 'src/shared/validation/validation.module';
import { rekognitionProviders } from './service/rekognition.provider';

@Module({
	imports: [ConfigModule, ValidationModule],
	controllers: [RecognitionController],
	providers: [...rekognitionProviders, RecognitionService],
	exports: [RecognitionService],
})
export class RecognitionModule {}
