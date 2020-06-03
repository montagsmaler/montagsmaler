import { Module } from '@nestjs/common';
import { WsModule } from './ws/ws.module';
import { HttpModule } from './http/http.module';

@Module({
  imports: [WsModule, HttpModule],
})
export class ApiModule {}
