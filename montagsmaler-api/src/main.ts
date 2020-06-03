import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = app.get<ConfigService>(ConfigService).get<string>('LISTENER_PORT');
  await app.listen(port);
  new Logger('NestApplication').log(`HTTP Server listening on port ${port}`);
}
bootstrap();
