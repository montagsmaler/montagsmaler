import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as helmet from 'helmet';
import * as rateLimit from 'express-rate-limit';

const hel = helmet as any;

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	const port = app.get<ConfigService>(ConfigService).get<string>('LISTENER_PORT');

	app.enableCors({ origin: true, credentials: true });
	app.use(
		rateLimit({
			windowMs: 15 * 60 * 1000,
			max: 1000,
		}),
	);
	app.use(hel());
	app.use(cookieParser());
	app.use(bodyParser.json({ limit: '50mb' }));
	app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

	await app.listen(port);

	new Logger('NestApplication').log(`HTTP Server listening on port ${port}`);
}
bootstrap();
