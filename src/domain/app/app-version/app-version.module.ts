import { Module } from '@nestjs/common';
import { AppVersionService } from './app-version.service';
import { AppVersionRepository } from './app-version.repository';
import { RedisModule } from '../../../shared/redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [
    { provide: AppVersionService.name, useClass: AppVersionService },
    { provide: AppVersionRepository.name, useClass: AppVersionRepository },
  ],
  exports: [{ provide: AppVersionService.name, useClass: AppVersionService }],
})
export class AppVersionModule {}
