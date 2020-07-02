import { Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Rekognition } from "aws-sdk";

export const rekognitionProviders: Provider[] = [
	{
		provide: 'rekognition_provider',
		useFactory: (configService: ConfigService): Rekognition => {
			return new Rekognition(
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