import { CacheModule, Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { getConfigData } from 'src/common/util/config.util';
import * as redisStore from 'cache-manager-ioredis';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async () => ({
        store: redisStore,
        clusterConfig: {
          nodes: [
            {
              host: getConfigData('REDIS_HOST'),
              port: getConfigData('REDIS_PORT'),
            },
          ],
        },
      }),
    }),
  ],
  providers: [{ provide: RedisService.name, useClass: RedisService }],
  exports: [{ provide: RedisService.name, useClass: RedisService }],
})
export class RedisModule {}
