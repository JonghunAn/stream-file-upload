import { Inject, Injectable } from '@nestjs/common';
import { AppInfo } from '../entity/app-info.entity';
import { changeToHttpException } from '../../../common/util/error.util';
import { IAppVersionRepository } from './interface/app-version.repository.interface';
import { IAppVersionService } from './interface/app-version.service.interface';
import { IRedisService } from '../../../shared/redis/interface/redis.service.interface';
import { Secret } from '../../../shared/redis/interface/response.interface';

@Injectable()
export class AppVersionService implements IAppVersionService {
  constructor(
    @Inject('AppVersionRepository') private readonly appVersionRepository: IAppVersionRepository,
    @Inject('RedisService') private readonly redisService: IRedisService<Secret[]>
  ) {}

  async validateSecret(secret: string): Promise<boolean> {
    let secrets = await this.redisService.getData('appSecret');
    if (!secrets) {
      secrets = await this.findAllSecret();
    }
    return secrets.includes(secret);
  }

  async findAllSecret() {
    const { androidInfos, iosInfos } = changeToHttpException(await this.appVersionRepository.findAll());
    const androidSecrets = androidInfos.map((appInfo: AppInfo) => appInfo.secret);
    const iosSecrets = iosInfos.map((appInfo: AppInfo) => appInfo.secret);

    return [...androidSecrets, ...iosSecrets];
  }
}
