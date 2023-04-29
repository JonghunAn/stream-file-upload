import { PlatformType } from '../../entity/app-info.entity';

export interface IAppPolicyService {
  getAppPolicy(): Promise<{
    iosStoreRedirectUrl: string;
    androidStoreRedirectUrl: string;
    iosIsCurrVerRecommended: boolean;
    androidIsCurrVerRecommended: boolean;
  }>;
  setAppPolicy(
    platformType: PlatformType,
    option: {
      storeRedirectUrl: string;
      isCurrVerRecommended: boolean;
    }
  ): Promise<{ isSet: boolean }>;
}
