import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { S3ParameterDto } from "../model/S3Para.dto";

export const S3Parameter = createParamDecorator((data: unknown, ctx: ExecutionContext): S3ParameterDto => {
	const request = ctx.switchToHttp().getRequest();
	const result = new S3ParameterDto();
	result.Bucket = request.query.bucket;
	result.Name = request.query.name;
	return result;
});