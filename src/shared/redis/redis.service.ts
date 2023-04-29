import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { IRedisService } from './interface/redis.service.interface';

@Injectable()
export class RedisService<T> implements IRedisService<T> {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getData(key: string): Promise<T | null> {
    return (await this.cacheManager.get(key)) as T | null;
  }

  async setData(key: string, data: any, ttl = 0): Promise<void> {
    await this.cacheManager.set(key, data, { ttl });
  }

  async deleteData(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }
}
