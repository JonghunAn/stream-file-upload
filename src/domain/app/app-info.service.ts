import { Inject, Injectable } from '@nestjs/common';
import { IAppInfoService } from './interface/app-info.service.interface';
import { IAppVersionService } from './app-version/interface/app-version.service.interface';

@Injectable()
export class AppInfoService implements IAppInfoService {
  constructor(@Inject('AppVersionService') private readonly appVersionService: IAppVersionService) {}

  async validateSecret(secret: string): Promise<boolean> {
    return await this.appVersionService.validateSecret(secret);
  }
}
