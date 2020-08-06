import { Module } from '@nestjs/common';
import { IdService } from './service/id.service';
import { KeyValueModule } from '../keyvalue/keyvalue.module';

@Module({
	imports: [KeyValueModule],
	providers: [IdService],
	exports: [IdService],
})
export class IdModule { }
