import { Module } from '@nestjs/common';
import { ValidationPipe } from './validation.pipe';

@Module({
	imports: [],
	providers: [ValidationPipe],
	exports: [ValidationPipe],
})
export class ValidationModule {}
