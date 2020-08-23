import { Module } from '@nestjs/common';
import { WsModule } from './ws/ws.module';
import { HttpModule } from './http/http.module';
import { ApiController } from './api.controller';

@Module({
  imports: [WsModule, HttpModule],
  controllers: [ApiController],
})
export class ApiModule {}
