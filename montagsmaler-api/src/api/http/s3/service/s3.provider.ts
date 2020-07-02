import { Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { S3 } from "aws-sdk";

export const S3Provider: Provider[] = [
	{
		provide: 'S3_provider',
		useFactory: (configService: ConfigService): S3 => {
			return new S3(
				{
					accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
					secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
					sessionToken: configService.get('AWS_SESSION_TOKEN'),
				}
			);
		},
		inject: [ConfigService],
	}
];