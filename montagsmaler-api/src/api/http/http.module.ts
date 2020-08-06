import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { RecognitionModule } from './recognition/recognition.module';
import { S3Module } from './s3/s3.module';

@Module({
  imports: [AuthModule, S3Module, RecognitionModule],
  controllers: [],
  providers: []
})
export class HttpModule {}
