import { BadRequestException, HttpException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export class ValidationBadRequestException extends HttpException {
	constructor(validationErrors: ValidationError[], message: string) {
		const exception = new BadRequestException(message);
		const response = exception.getResponse().valueOf() as Record<string, any>;
		response.validationErrors = validationErrors;
		super(response, exception.getStatus());
	}
}