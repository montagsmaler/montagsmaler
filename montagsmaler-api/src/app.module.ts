import { Module } from '@nestjs/common';
import { ApiModule } from './api/api.module';
import { ConfigModule } from '@nestjs/config';
import { ConfigModuleOptions } from '@nestjs/config/dist/interfaces';
import { RedisModule } from './shared/redis/redis.module';
import { GameModule } from './game';

export const configModuleOptionsFactory = (): ConfigModuleOptions => {
	const NODE_ENV = process.env.NODE_ENV;
	const USE_FILE = process.env.USE_FILE;
	if (USE_FILE === 'false') {
		return {};
	} else {
		return {
			envFilePath: `${NODE_ENV || 'development'}.env`,
		};
	}
};

@Module({
	imports: [
		ConfigModule.forRoot(configModuleOptionsFactory()),
		ApiModule,
		RedisModule,
		GameModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule { }
