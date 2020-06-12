import { Module } from '@nestjs/common';
import { ApiModule } from './api/api.module';
import { ConfigModule } from '@nestjs/config';
import { ConfigModuleOptions } from '@nestjs/config/dist/interfaces';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from './shared/validation/validation.pipe';

const configModuleOptionsFactory = (): ConfigModuleOptions => {
  const NODE_ENV = process.env.NODE_ENV;
  if (NODE_ENV === 'production') {
    return {};
  } else {
    return {
      envFilePath:  `${NODE_ENV || 'development'}.env`,
    };
  }
};

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOptionsFactory()), 
    ApiModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
