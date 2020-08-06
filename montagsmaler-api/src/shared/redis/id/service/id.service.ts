import { Injectable } from '@nestjs/common';
import { KeyValueService } from '../../keyvalue/service/keyvalue.service';
import { v4 as uuidv4 } from 'uuid';

const INCREMENTAL_ID = 'incremental_id:';

@Injectable()
export class IdService {

	constructor(
		private readonly keyValueService: KeyValueService,
	) { }

	public getUUID(): string {
		return uuidv4();
	}

	public async getIncrementalID(): Promise<number> {
		return await this.keyValueService.increment(INCREMENTAL_ID);
	}
}
