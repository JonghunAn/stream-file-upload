import { initTelemetry } from './tracing';
// ----- this has to come before imports! -------
if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
  initTelemetry({
    appName: 'steam-file-upload-server',
    telemetryUrl: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || '',
  });
  console.log('initialised telemetry');
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { getConfigData } from './common/util/config.util';
import { ConfigData } from './common/constant/config-data.enum';
import { HttpExceptionFilter } from 'src/common/filter/http-exception.filter';
import { SlackService } from 'src/shared/slack/slack.service';
import { ErrorFilter } from 'src/common/filter/error.filter';

async function bootstrap() {
  Logger.log(`Initializing Bootstrap, current environment: ${process.env.NODE_ENV}`, 'Bootstrap');
  const app = await NestFactory.create(AppModule, { cors: true });
  const slackService = app.get<SlackService>(SlackService.name);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  );
  /** error filter를 먼저 global filter로 선언해주어야 함. */
  app.useGlobalFilters(new ErrorFilter(slackService));
  app.useGlobalFilters(new HttpExceptionFilter(slackService));
  app.enableShutdownHooks();

  await app.listen(parseInt(process.env.WEB_SOCKET_PORT ?? '3000'));

  if (
    process.env.NODE_ENV === 'production' ||
    (process.env.NODE_ENV === 'development' && JSON.parse(getConfigData(ConfigData.QA_PERIOD)))
  ) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
    });
  }
}
bootstrap();
