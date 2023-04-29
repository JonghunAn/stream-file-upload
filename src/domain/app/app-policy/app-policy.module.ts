import { Module } from '@nestjs/common';
import { AppPolicyRepository } from './app-policy.repository';
import { AppPolicyService } from './app-policy.service';
import { RedisModule } from '../../../shared/redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [
    { provide: AppPolicyService.name, useClass: AppPolicyService },
    { provide: AppPolicyRepository.name, useClass: AppPolicyRepository },
  ],
  exports: [{ provide: AppPolicyService.name, useClass: AppPolicyService }],
})
export class AppPolicyModule {}
