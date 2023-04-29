import { GDBResponse } from 'src/common/interface/gdb-response.interface';
import { AppInfo, PlatformType } from '../entity/app-info.entity';

export interface IAppInfoRepository {
  get(version: number, platformType: PlatformType): Promise<GDBResponse<AppInfo>>;
  findAll(platformType: PlatformType): Promise<GDBResponse<{ appInfos: AppInfo[] }>>;
}
