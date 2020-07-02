import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { RecognitionModule } from './recognition/recognition.module';

@Module({
  imports: [AuthModule, RecognitionModule]
})
export class HttpModule {}
