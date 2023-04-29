import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import * as Joi from 'joi';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './domain/user/user.module';
import { GraphDatabaseModule } from './shared/graph-database/graph-database.module';
import { TopicModule } from './domain/topic/topic.module';
import { AppInfoModule } from './domain/app/app-info.module';
import { getConfigData } from './common/util/config.util';
import { ConfigData } from './common/constant/config-data.enum';
import { RedisModule } from './shared/redis/redis.module';
import { SlackModule } from 'src/shared/slack/slack.module';
import { Server } from 'http';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${getConfigData(ConfigData.NODE_ENV)}.env`,
      validationSchema: Joi.object({
        NODE_ENV: Joi.valid('production', 'stage', 'development', 'test'),
        GRAPH_SERVER_CONNECTION_URL: Joi.string().required(),
        GRAPH_SERVER_CONNECTION_USERNAME: Joi.string().required(),
        GRAPH_SERVER_CONNECTION_PASSWORD: Joi.string().required(),
        SLACK_ERR_ALARM_URL: Joi.string().required(),
        SENTRY_DSN: Joi.string().required(),
        AWS_ACCESS_KEY_ID: Joi.string().required(),
        AWS_SECRET_ACCESS_KEY: Joi.string().required(),
        AWS_S3_BUCKET_NAME: Joi.string().required(),
        AWS_S3_BUCKET_REGION: Joi.string().required(),
        AWS_S3_URL: Joi.string().required(),
        QA_PERIOD:
          getConfigData(ConfigData.NODE_ENV) === 'development'
            ? Joi.string().required() && Joi.valid('true', 'false')
            : Joi.string(),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.string().required(),
      }),
    }),
    UserModule,
    GraphDatabaseModule,
    TopicModule,
    AppModule,
    AppInfoModule,
    RedisModule,
    SlackModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(private readonly httpAdpterHost: HttpAdapterHost<any>) {}
  onApplicationBootstrap() {
    const server: Server = this.httpAdpterHost.httpAdapter.getHttpServer();
    server.keepAliveTimeout = 90000;
  }
}
