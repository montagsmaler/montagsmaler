import { Provider } from '@nestjs/common';
import { CognitoUserPool, ICognitoUserPoolData } from 'amazon-cognito-identity-js';
import { ConfigService } from '@nestjs/config';

export const awsProvider: Provider[] = [
	{
		provide: 'aws_cognito_user_pool',
		useFactory: (configService: ConfigService) => {
			const pooldata: ICognitoUserPoolData = {
				UserPoolId: configService.get('USER_POOL_ID'),
				ClientId: configService.get('CLIENT_ID'),
			};
			return new CognitoUserPool(pooldata);
		},
		inject: [ConfigService],
	},
	{
		provide: 'aws_cognito_issuer_url',
		useFactory: (configService: ConfigService) => `https://cognito-idp.${configService.get('AWS_REGION')}.amazonaws.com/${configService.get('USER_POOL_ID')}`,
		inject: [ConfigService],
	}
];
