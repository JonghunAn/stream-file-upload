import { GDBResponse } from '../../../../common/interface/gdb-response.interface';
import { PlatformType } from '../../entity/app-info.entity';

export interface IAppPolicyRepository {
  getCurrentAppPolicy(): Promise<
    GDBResponse<{
      iosInfo: { isCurrVerRecommended: boolean; storeRedirectUrl: string };
      androidInfo: { isCurrVerRecommended: boolean; storeRedirectUrl: string };
    }>
  >;
  setCurrentAppPolicy(
    platformType: PlatformType,
    option: { isCurrVerRecommended?: boolean; storeRedirectUrl?: string }
  ): Promise<GDBResponse<{ isSet: boolean }>>;
}
