import { Inject, Injectable } from '@nestjs/common';
import { changeToHttpException } from '../../../common/util/error.util';
import { PlatformType } from '../entity/app-info.entity';
import { IAppPolicyRepository } from './interface/app-policy.repository.interface';
import { IAppPolicyService } from './interface/app-policy.service.interface';

@Injectable()
export class AppPolicyService implements IAppPolicyService {
  constructor(@Inject('AppPolicyRepository') private readonly appPolicyRepository: IAppPolicyRepository) {}

  async getAppPolicy(): Promise<{
    iosStoreRedirectUrl: string;
    androidStoreRedirectUrl: string;
    iosIsCurrVerRecommended: boolean;
    androidIsCurrVerRecommended: boolean;
  }> {
    const res = changeToHttpException(await this.appPolicyRepository.getCurrentAppPolicy());

    const {
      iosInfo: { isCurrVerRecommended: iosIsCurrVerRecommended, storeRedirectUrl: iosStoreRedirectUrl },
      androidInfo: { isCurrVerRecommended: androidIsCurrVerRecommended, storeRedirectUrl: androidStoreRedirectUrl },
    } = res;

    return { iosIsCurrVerRecommended, iosStoreRedirectUrl, androidIsCurrVerRecommended, androidStoreRedirectUrl };
  }

  async setAppPolicy(
    platformType: PlatformType,
    option: {
      storeRedirectUrl: string;
      isCurrVerRecommended: boolean;
    }
  ): Promise<{ isSet: boolean }> {
    changeToHttpException(await this.appPolicyRepository.setCurrentAppPolicy(platformType, option));

    return { isSet: true };
  }
}
