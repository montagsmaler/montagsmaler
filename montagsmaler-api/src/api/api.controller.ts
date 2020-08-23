import { Controller, Get } from '@nestjs/common';

@Controller()
export class ApiController {

	@Get()
	healthCheck(): string {
		return 'SUCCESS';
	}
}
