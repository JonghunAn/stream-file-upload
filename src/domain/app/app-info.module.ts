import { Module } from '@nestjs/common';
import { RedisModule } from 'src/shared/redis/redis.module';
import { AppInfoService } from './app-info.service';
import { AppPolicyModule } from './app-policy/app-policy.module';
import { AppVersionModule } from './app-version/app-version.module';

@Module({
  imports: [RedisModule, AppPolicyModule, AppVersionModule],
  providers: [{ provide: AppInfoService.name, useClass: AppInfoService }],
  exports: [{ provide: AppInfoService.name, useClass: AppInfoService }],
})
export class AppInfoModule {}
