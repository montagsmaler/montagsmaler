import { Module } from '@nestjs/common';
import { ApiModule } from './api/api.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath:  `${process.env.NODE_ENV || 'development'}.env`,
    }), 
    ApiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
